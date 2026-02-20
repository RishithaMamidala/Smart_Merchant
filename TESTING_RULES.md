# In-Depth Testing Rules for MCP Browser Tools

## Core Testing Principles

### 1. Never Assume - Always Verify
- ❌ Don't assume a button exists - use `browser_snapshot` to verify
- ❌ Don't assume login worked - check the URL and page content
- ❌ Don't assume data loaded - verify elements are present
- ✅ Always capture the current state before taking action
- ✅ Always verify the result after each action

### 2. Snapshot First, Act Second
```
For EVERY test step:
1. Take snapshot to see current state
2. Identify exact element references (ref=e7)
3. Perform action using the ref
4. Take snapshot again to verify result
```

### 3. Test the Full Flow, Not Just Happy Paths
- Test what happens when forms are submitted empty
- Test what happens with invalid data
- Test what happens when network fails
- Test error messages actually appear
- Test edge cases (special characters, long strings, etc.)

### 4. Verify State Changes Explicitly
After every action, verify:
- Did the URL change? (redirects, navigation)
- Did new elements appear? (modals, notifications, errors)
- Did elements disappear? (loading spinners, forms)
- Did text content update? (cart count, user name)
- Check console for errors/warnings

### 5. Wait for Dynamic Content
```
After navigation or actions:
1. Use browser_wait_for to ensure content loads
2. Check for loading indicators to disappear
3. Verify API calls completed (check console/network)
4. Don't proceed until page is stable
```

### 6. Use Exact References
- ❌ Don't use generic selectors like "click the button"
- ✅ Use exact refs from snapshot: `ref=e15`
- ✅ Use descriptive element parameter: `element="Submit login form button"`

### 7. Test Data Isolation
- Use unique test data each time (timestamps, UUIDs)
- Don't rely on existing database state
- Create test users/products as part of the test
- Clean up after tests (delete test data)

### 8. Check All Console Outputs
```
After EVERY navigation or action:
1. Use browser_console_messages to check for errors
2. Verify no unexpected warnings
3. Check for failed API calls
4. Look for validation errors
```

### 9. Test Authentication Flows Completely
```
For login tests:
1. Verify logged-out state first
2. Fill credentials
3. Submit form
4. Verify redirect happened
5. Verify protected content is visible
6. Verify token is stored (check application state)
7. Test logout completely reverses this
```

### 10. Test Form Validation Thoroughly
```
For each form:
1. Submit empty form - verify all required field errors
2. Submit with one field missing - verify specific error
3. Submit with invalid format - verify format errors
4. Submit with valid data - verify success
5. Check error messages are user-friendly
6. Check errors clear when corrected
```

---

## Testing Workflow Template

### Complete Test Structure
```
TEST: [Feature Name]

SETUP:
1. browser_navigate to starting URL
2. browser_snapshot to verify initial state
3. browser_console_messages to check for errors
4. Prepare test data (if needed)

EXECUTION:
For each step:
  1. browser_snapshot - capture current state
  2. Identify element refs from snapshot
  3. Perform action (click, type, fill_form)
  4. browser_wait_for - wait for state change
  5. browser_snapshot - verify new state
  6. browser_console_messages - check for errors

VERIFICATION:
1. browser_snapshot - final state
2. Verify expected elements present
3. Verify expected elements NOT present
4. Verify URL is correct
5. Verify console has no errors
6. Take screenshot for documentation

CLEANUP:
1. Delete test data (if created)
2. Return to known state
3. browser_close (if done testing)
```

---

## Data Validation Rules

### Always Test With:
- **Empty strings**: `""`
- **Whitespace only**: `"   "`
- **Very long strings**: `"a" * 1000`
- **Special characters**: `!@#$%^&*(){}[]<>`
- **SQL injection attempts**: `' OR '1'='1`
- **XSS attempts**: `<script>alert('xss')</script>`
- **Unicode characters**: `你好🚀`
- **Numbers as strings**: `"12345"`
- **Negative numbers**: `-100`
- **Zero**: `0`
- **Very large numbers**: `999999999`

---

## Accessibility Checks

- [ ] All interactive elements have visible focus states
- [ ] Forms have proper labels
- [ ] Error messages are associated with fields
- [ ] Images have alt text
- [ ] Buttons have descriptive text (not just icons)
- [ ] Color contrast is sufficient

---

## Performance Checks

- [ ] Page loads within reasonable time
- [ ] No console errors on load
- [ ] Images load properly
- [ ] API calls complete successfully
- [ ] Loading states appear during async operations

---

## Security Checks

- [ ] Sensitive data not exposed in console
- [ ] Tokens not visible in localStorage (should be httpOnly cookies)
- [ ] CSRF protection works
- [ ] Rate limiting prevents spam
- [ ] Protected routes redirect unauthorized users

## Example: Bad vs Good Test

### ❌ BAD Test (Makes Assumptions)
```
1. Navigate to login page
2. Type email
3. Type password
4. Click login
5. ✅ Done!
```

**Problems:**
- Doesn't verify form exists
- Doesn't check if credentials were typed correctly
- Doesn't verify login succeeded
- Doesn't check for errors
- No state verification

### ✅ GOOD Test (Follows Rules)
```
1. browser_navigate http://localhost:5173/login
2. browser_snapshot → verify login form is present
3. browser_console_messages → verify no errors on load
4. browser_fill_form with test credentials
5. browser_snapshot → verify form filled correctly
6. browser_click on Submit button (using ref from snapshot)
7. browser_wait_for URL to change to dashboard
8. browser_snapshot → verify dashboard loaded
9. browser_evaluate → check if auth token exists in correct place
10. browser_console_messages → verify no errors after login
11. Verify user name displays in header
12. Verify logout button is present
13. browser_take_screenshot for documentation
14. ✅ Login fully verified!
```

**Benefits:**
- Every step is verified
- State is checked before and after actions
- Console errors are monitored
- Screenshots provide documentation
- No assumptions made

## Common Pitfalls to Avoid

1. **Not waiting for dynamic content**
   - Always use `browser_wait_for` after actions that trigger async operations

2. **Using stale element references**
   - Take fresh snapshot if page state changed

3. **Skipping console checks**
   - Errors might occur without visual indication

4. **Testing only happy paths**
   - Edge cases and errors are where bugs hide

5. **Not verifying state changes**
   - Just because no error appeared doesn't mean it worked

6. **Hardcoding test data**
   - Use unique identifiers to avoid conflicts

7. **Not cleaning up after tests**
   - Leftover data can affect subsequent tests

8. **Assuming network is always fast**
   - Always wait for network operations to complete

---

## Tips for Effective Testing

1. **Start with manual exploration**
   - Use `browser_snapshot` to understand the page structure first

2. **Test in isolation**
   - Each test should be independent and not rely on others

3. **Use descriptive element parameters**
   - Makes tool calls self-documenting

4. **Take screenshots liberally**
   - Visual proof is invaluable for debugging

5. **Check network requests**
   - Verify API calls succeed, check for failed requests

6. **Test mobile views**
   - Use `browser_resize` to test responsive design

7. **Automate repetitive setups**
   - Create reusable test helpers for common flows (login, etc.)

8. **Document expected behavior**
   - Write down what should happen before testing

---

## Template for New Tests

```markdown
## Test: [Feature Name]

### Prerequisites
- Backend running on port 5000
- Frontend running on port 5173
- Test user exists: test@example.com / TestPass123!

### Test Steps

#### 1. Setup
- [ ] Navigate to [URL]
- [ ] Verify initial state
- [ ] Check console for errors

#### 2. Action: [Describe action]
- [ ] Take snapshot
- [ ] Perform action
- [ ] Wait for state change
- [ ] Verify result
- [ ] Check console

#### 3. Action: [Next action]
- [ ] Take snapshot
- [ ] Perform action
- [ ] Wait for state change
- [ ] Verify result
- [ ] Check console

#### 4. Verification
- [ ] Final snapshot
- [ ] All expected elements present
- [ ] No unexpected errors
- [ ] Take screenshot

#### 5. Cleanup
- [ ] Delete test data
- [ ] Return to initial state

### Expected Results
- [What should happen]

### Actual Results
- [What actually happened]

### Issues Found
- [Any bugs or problems discovered]
```

---

## Quick Reference: Test Flow Pattern

```
NAVIGATE → SNAPSHOT → VERIFY STATE → ACT → WAIT → SNAPSHOT → VERIFY CHANGE → CONSOLE CHECK → REPEAT
```

Remember: **Never assume, always verify!**
