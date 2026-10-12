-- Migration: Peer-to-Peer Student Cash Transfers
-- Function: send_peer_money(sender_matric, receiver_matric, transfer_amount)

CREATE OR REPLACE FUNCTION send_peer_money(
  sender_matric text,
  receiver_matric text,
  transfer_amount numeric
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  sender_rec record;
  receiver_rec record;
  new_sender_balance numeric;
BEGIN
  -- 1. Prevent transfer to self
  IF sender_matric = receiver_matric THEN
    RETURN json_build_object('success', false, 'message', 'Cannot send money to yourself');
  END IF;

  -- 2. Validate transfer amount
  IF transfer_amount <= 0 THEN
    RETURN json_build_object('success', false, 'message', 'Transfer amount must be greater than zero');
  END IF;

  -- 3. Lock and retrieve sender record
  SELECT * INTO sender_rec FROM students WHERE matric_no = sender_matric FOR UPDATE;
  IF NOT FOUND THEN
    RETURN json_build_object('success', false, 'message', 'Sender account not found');
  END IF;

  -- 4. Verify sufficient funds
  IF COALESCE(sender_rec.cash, 0) < transfer_amount THEN
    RETURN json_build_object('success', false, 'message', 'Insufficient funds');
  END IF;

  -- 5. Lock and retrieve receiver record
  SELECT * INTO receiver_rec FROM students WHERE matric_no = receiver_matric FOR UPDATE;
  IF NOT FOUND THEN
    RETURN json_build_object('success', false, 'message', 'Recipient account not found');
  END IF;

  -- 6. Compute new balance and update both records atomically
  new_sender_balance := COALESCE(sender_rec.cash, 0) - transfer_amount;

  UPDATE students SET cash = new_sender_balance WHERE matric_no = sender_matric;
  UPDATE students SET cash = COALESCE(receiver_rec.cash, 0) + transfer_amount WHERE matric_no = receiver_matric;

  RETURN json_build_object(
    'success', true,
    'new_balance', new_sender_balance,
    'message', 'Transfer successful'
  );
END;
$$;
