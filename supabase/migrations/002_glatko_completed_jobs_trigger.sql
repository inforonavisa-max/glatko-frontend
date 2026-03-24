CREATE OR REPLACE FUNCTION glatko_on_job_complete()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
DECLARE
  pro_id UUID;
BEGIN
  IF NEW.status = 'completed' AND OLD.status = 'in_progress' THEN
    SELECT professional_id INTO pro_id
    FROM glatko_bids
    WHERE id = NEW.assigned_bid_id;

    IF pro_id IS NOT NULL THEN
      UPDATE glatko_professional_profiles
      SET completed_jobs = completed_jobs + 1,
          updated_at = now()
      WHERE id = pro_id;
    END IF;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_glatko_job_complete ON glatko_service_requests;
CREATE TRIGGER trg_glatko_job_complete
  AFTER UPDATE ON glatko_service_requests
  FOR EACH ROW
  WHEN (NEW.status = 'completed' AND OLD.status = 'in_progress')
  EXECUTE FUNCTION glatko_on_job_complete();
