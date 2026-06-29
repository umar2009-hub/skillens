# SkillLens Project Structure

## Root
- `frontend/` - React frontend (Vite)
- `backend/` - Node.js Express API
- `docs/` - Documentation

## Frontend Architecture
```text
frontend/
├── index.html
├── package.json
├── vite.config.js
├── tailwind.config.js
├── postcss.config.js
├── jsconfig.json
└── src/
    ├── main.jsx
    ├── App.jsx
    ├── index.css
    ├── assets/
    │   ├── images/
    │   ├── icons/
    │   ├── logos/
    │   ├── illustrations/
    │   └── animations/
    ├── components/
    │   └── ui/
    │       ├── Accordion.jsx
    │       ├── Avatar.jsx
    │       ├── Badge.jsx
    │       ├── Button.jsx
    │       ├── Card.jsx
    │       ├── Dialog.jsx
    │       ├── Drawer.jsx
    │       ├── Dropdown.jsx
    │       ├── Input.jsx
    │       ├── Modal.jsx
    │       ├── Progress.jsx
    │       ├── Skeleton.jsx
    │       ├── Spinner.jsx
    │       ├── Tabs.jsx
    │       ├── Textarea.jsx
    │       └── Tooltip.jsx
    ├── layouts/
    │   ├── AuthLayout.jsx
    │   ├── DashboardLayout.jsx
    │   └── LandingLayout.jsx
    ├── pages/
    │   ├── AIMentor.jsx
    │   ├── Analytics.jsx
    │   ├── Dashboard.jsx
    │   ├── Landing.jsx
    │   ├── NotFound.jsx
    │   ├── Quiz.jsx
    │   ├── Settings.jsx
    │   └── Upload.jsx
    ├── routes/
    │   ├── ProtectedRoute.jsx
    │   └── PublicRoute.jsx
    ├── services/
    │   ├── api.js
    │   ├── auth.service.js
    │   ├── upload.service.js
    │   ├── mentor.service.js
    │   ├── analytics.service.js
    │   └── quiz.service.js
    ├── hooks/
    │   ├── useApi.js
    │   ├── useDebounce.js
    │   ├── useLocalStorage.js
    │   ├── useTheme.js
    │   └── useToast.js
    ├── constants/
    │   ├── animations.js
    │   ├── api.js
    │   ├── routes.js
    │   └── theme.js
    └── utils/
        ├── cn.js
        ├── formatDate.js
        ├── helpers.js
        ├── storage.js
        └── validators.js
```

## Backend Architecture
```text
backend/
├── package.json
├── server.js
├── config/
│   ├── index.js
│   └── supabase.js
├── controllers/
│   ├── analytics.controller.js
│   ├── auth.controller.js
│   ├── mentor.controller.js
│   ├── quiz.controller.js
│   └── upload.controller.js
├── middleware/
│   ├── asyncHandler.js
│   └── errorHandler.js
├── repositories/
│   ├── analytics.repository.js
│   ├── auth.repository.js
│   ├── mentor.repository.js
│   ├── quiz.repository.js
│   └── upload.repository.js
├── routes/
│   └── v1/
│       └── index.js
├── services/
│   ├── analytics.service.js
│   ├── auth.service.js
│   ├── mentor.service.js
│   ├── quiz.service.js
│   └── upload.service.js
└── utils/
    ├── logger.js
    └── responseHelper.js
```
