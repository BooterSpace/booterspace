## BooterSpace Dynamic Professional Network Website

This repository now contains a LinkedIn-inspired multi-page dynamic website built with plain HTML, CSS, and JavaScript.

### Included pages/features
- `login.html` / `signup.html` for account entry flows
- `index.html` for dynamic feed and post composer
- `network.html` for searchable connections
- `jobs.html` for searchable job listings and apply actions
- `messaging.html` for direct messaging interactions
- `notifications.html` for activity updates
- `profile.html` for editable profile details

### Dynamic behavior
All interactive features are handled in `app.js` and persisted in `localStorage`:
- posting and liking feed content
- profile editing
- live search for people/jobs
- sending messages

### Run locally
```bash
python3 -m http.server 8000
```
Then open `http://localhost:8000/login.html`.
