# Deploying to Vercel

This project is optimized for deployment on Vercel. Follow these steps to deploy.

## 1. Import Project
1. Go to [Vercel Dashboard](https://vercel.com/dashboard).
2. Click **"Add New..."** -> **"Project"**.
3. Import your Git repository.
4. Framework Preset should be detected as **Next.js**.

## 2. Environment Variables
Configure the following environment variables in the Project Settings -> Environment Variables.

| Variable Name | Description | Required | Reference |
|---|---|---|---|
| `GOOGLE_API_KEY` | API Key for Gemini (Google Generative AI). | Yes (for Meeting AI) | [Get API Key](https://aistudio.google.com/) |
| `RESEND_API_KEY` | API Key for Resend (Email Service). | Yes (for future features) | [Get API Key](https://resend.com/) |
| `RESEND_FROM` | Sender email address (e.g., `onboarding@resend.dev`). | No (Default fallback) | |

> **Note**: If you previously used `GEMINI_API_KEY`, the code supports it as a fallback, but `GOOGLE_API_KEY` is preferred.

## 3. Deployment Verification
After deployment, verify the build status is **Ready**.

### Test API (Health Check)
You can verify the runtime using `curl`:

```bash
# Check if the main page loads
curl -I https://your-project-url.vercel.app/

# Test the Analysis API (Method allowed check - should be 405 or 400 without file)
curl -X POST https://your-project-url.vercel.app/api/analyze-meeting
```

## 4. Troubleshooting
- **Build Errors**: Check the Build Logs for TypeScript or Linting errors. We have fixed known type issues in `AnalyticsView` and `RnRTable`.
- **Runtime Errors**: If the AI features fail, check the Runtime Logs to understand if it's a timeout (Vercel generic limits are 10s-60s) or an API Key issue.
