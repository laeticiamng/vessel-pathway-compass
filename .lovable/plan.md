

## Testing the Patients Page

I navigated to the auth page and switched to the sign-up form. However, I'm currently in **plan mode (read-only)** and cannot:

1. Enable auto-confirm for email signups (requires a backend configuration change)
2. Make any code changes to bypass authentication

To proceed with end-to-end testing, I need to switch to **default mode**. Once there, I can:

1. **Enable auto-confirm** for email signups so I can create a test account
2. **Sign up** with a test email and password
3. **Navigate** to `/app/patients`
4. **Create a new case** using the dialog (fill pseudonym, age range, sex, category, case title)
5. **Verify** the new case appears in the patient list
6. **Test search** by typing the pseudonym in the search bar
7. **Test filters** by selecting a category and status from the dropdowns
8. **Screenshot** each step to confirm everything works

### Action Needed

Please either:
- Switch me to default mode so I can enable auto-confirm and run the full test
- Or log in yourself in the preview, then ask me to test again

