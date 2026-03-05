-- @param {String} $1:userId
WITH _lock AS (
  SELECT pg_advisory_xact_lock(('x' || substr(md5($1), 1, 16))::bit(64)::bigint)
)
SELECT COALESCE(SUM(
  CASE WHEN type = 'CREDIT' THEN amount
       WHEN type = 'DEBIT'  THEN -amount
  END
), 0) AS balance
FROM (
  SELECT * FROM ledger_transactions
  WHERE user_id = $1
  FOR UPDATE
) AS lt;