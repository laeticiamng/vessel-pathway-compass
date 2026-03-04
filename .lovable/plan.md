

## Patient Detail View — Already Implemented

After reviewing `src/pages/app/PatientDetail.tsx` (430 lines), this page already has everything requested:

### Existing Features
- **Case timeline** — vertical timeline with icons per event type (procedure, imaging, note, lab), relative timestamps, and an "Add Event" dialog
- **Measurements tab** — table showing type, value, unit, site, date with an "Add Measurement" dialog
- **Cases tab** — lists all associated cases with category, status, and summary
- **Edit patient** — dialog to update pseudonym, age range, and sex
- **Summary cards** — counts for cases, timeline events, and measurements
- **Full i18n** — all strings use `t()` with keys in en/fr/de dictionaries
- **Routing** — already wired at `/app/patients/:id` and linked from the Patients list via `navigate()`

### No changes needed

The page is complete and functional. You can test it by clicking any patient row on the Patients page.

If you'd like to **enhance** it further, here are some ideas I could implement instead:
- Add ability to delete events or measurements
- Add inline editing for measurements
- Add a risk factors editor
- Add case summary editing
- Add measurement trend charts (using recharts)

