-- @param {String} $1:userId
SELECT COALESCE(SUM(
  CASE WHEN type = 'CREDIT' THEN amount
       WHEN type = 'DEBIT'  THEN -amount
  END
), 0) AS balance
FROM ledger_transactions
WHERE user_id = $1;