# 🎨 Frontend Testing & Setup Guide

## 🚀 Quick Setup

### 1. Frontend-only Development (Backend через Docker)
```bash
# В одному терміналі - запустити backend
cd backend
./quick_start.sh

# В іншому терміналі - запустити frontend
cd frontend
npm install
npm start
```

### 2. Full Docker Setup
```bash
# Запустити весь проект
docker-compose up -d

# Frontend буде доступний на http://localhost:3000
# Backend API на http://localhost:8000
```

## 📁 Структура Frontend

```
frontend/
├── public/
│   ├── index.html
│   └── manifest.json
├── src/
│   ├── components/
│   │   ├── image/           # Компоненти для роботи з зображеннями
│   │   ├── segmentation/    # Компоненти алгоритмів сегментації
│   │   ├── layout/          # Layout компоненти
│   │   └── common/          # Загальні компоненти
│   ├── hooks/               # Custom React hooks
│   ├── services/            # API та WebSocket сервіси
│   ├── stores/              # Zustand state management
│   ├── types/               # TypeScript типи
│   ├── utils/               # Утиліти та константи
│   ├── styles/              # Стилі та теми
│   ├── App.tsx              # Головний компонент
│   └── index.tsx            # Entry point
├── package.json
├── tsconfig.json
└── Dockerfile
```

## 🎯 Ключові компоненти

### 📸 Image Components
- **ImageUpload**: Drag & drop завантаження зображень
- **ImagePreview**: Перегляд зображень з zoom та fullscreen
- **ImageGrid**: 2x2 сітка для порівняння результатів

### 🧮 Segmentation Components  
- **AlgorithmSelector**: Вибір алгоритмів сегментації
- **ParameterPanel**: Real-time налаштування параметрів
- **ResultViewer**: Відображення результатів сегментації

### 🎛️ Layout Components
- **MainLayout**: Головний layout з sidebar та header
- **Sidebar**: Бічна панель з контролами
- **ViewModeToggle**: Перемикач між режимами перегляду

## 🔧 Функціональність

### ✨ Core Features
- ✅ **Multi-view modes**: Single, Split, Grid 2×2
- ✅ **Real-time parameter tuning**: WebSocket updates
- ✅ **Drag & drop upload**: Підтримка JPEG, PNG, BMP, TIFF
- ✅ **Algorithm comparison**: До 4 алгоритмів одночасно
- ✅ **Export results**: JSON конфігурації та зображення
- ✅ **Dark/Light theme**: Автоматичне збереження в localStorage

### 🎨 UI/UX Features
- ✅ **Material-UI design**: Сучасний responsive дизайн
- ✅ **Toast notifications**: Feedback для користувача
- ✅ **Loading states**: Progress indicators
- ✅ **Error boundaries**: Graceful error handling
- ✅ **Responsive design**: Працює на мобільних пристроях

### 🚀 Performance Features
- ✅ **State management**: Zustand для ефективного state
- ✅ **Debounced updates**: Оптимізація parameter updates
- ✅ **Image caching**: Кешування завантажених зображень
- ✅ **Code splitting**: Lazy loading компонентів

## 🧪 Testing Frontend

### 1. Запуск у Development режимі
```bash
cd frontend
npm install
npm start

# Відкрити http://localhost:3000
```

### 2. Testing User Flow

#### 📤 Image Upload Test
1. Перейти на http://localhost:3000
2. Drag & drop зображення або клікнути "Choose File"
3. Перевірити preview та metadata (розмір, dimensions)

#### 🧮 Algorithm Selection Test
1. Обрати алгоритми з доступних (Felzenszwalb, SLIC, Quickshift, Watershed)
2. Налаштувати параметри за допомогою слайдерів
3. Перевірити real-time updates (якщо WebSocket підключений)

#### 🎛️ View Mode Test
1. Переключити між Single, Split, Grid 2×2 режимами
2. Перевірити responsive layout
3. Тестувати fullscreen mode

#### 🚀 Segmentation Test
1. Натиснути "Start Segmentation"
2. Спостерігати progress indicators
3. Перевірити результати в обраному view mode
4. Тестувати download функціональність

### 3. Browser Compatibility
- ✅ Chrome 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Edge 90+

## 🔍 Troubleshooting

### ❌ Frontend не запускається
```bash
# Очистити cache
rm -rf node_modules package-lock.json
npm install

# Перевірити порти
netstat -tlnp | grep :3000
```

### ❌ Backend API недоступний
```bash
# Перевірити CORS налаштування в .env
CORS_ORIGINS=http://localhost:3000,http://127.0.0.1:3000

# Перевірити proxy в package.json
"proxy": "http://backend:8000"
```

### ❌ WebSocket не підключається
```bash
# Перевірити WebSocket URL в .env
REACT_APP_WS_URL=ws://localhost:8000

# Перевірити backend WebSocket endpoint
curl -i -N -H "Connection: Upgrade" -H "Upgrade: websocket" -H "Sec-WebSocket-Key: test" -H "Sec-WebSocket-Version: 13" http://localhost:8000/api/v1/ws
```

### ❌ TypeScript помилки
```bash
# Type checking
npm run type-check

# Fix linting issues
npm run lint:fix
```

## 🎨 Customization

### Theme Customization
```typescript
// src/styles/theme.ts
export const createAppTheme = (darkMode: boolean) => {
  return createTheme({
    palette: {
      primary: { main: '#your-color' },
      // ... custom colors
    }
  });
};
```

### Adding New Algorithms
```typescript
// src/utils/constants.ts
export const ALGORITHM_CONFIGS = {
  your_algorithm: {
    name: 'your_algorithm',
    displayName: 'Your Algorithm',
    description: 'Description',
    color: '#color',
    defaultParams: { /* ... */ }
  }
};
```

### Custom View Modes
```typescript
// src/types/segmentation.ts
export type ViewMode = 'single' | 'split' | 'grid_2x2' | 'your_mode';

// src/utils/constants.ts
export const VIEW_MODES = {
  your_mode: {
    name: 'your_mode',
    displayName: 'Your Mode',
    description: 'Description'
  }
};
```

## 📊 Performance Monitoring

### Bundle Analysis
```bash
npm run analyze
```

### Performance Metrics
```bash
# Web Vitals in console
npm start
# Відкрити DevTools > Console для metrics
```

### Lighthouse Audit
1. Відкрити Chrome DevTools
2. Перейти в Lighthouse tab
3. Запустити аудит для Performance, Accessibility, SEO

## 🚀 Production Build

```bash
# Build for production
npm run build

# Test production build locally
npx serve -s build -p 3000

# Docker production build
docker build -t segmentation-frontend --target production .
docker run -p 3000:80 segmentation-frontend
```

## 📈 Next Steps

Після тестування frontend:

1. ✅ **Frontend працює** - UI відображається коректно
2. 🔗 **Backend інтеграція** - API calls працюють
3. 📱 **Mobile testing** - Responsive на різних пристроях  
4. 🎨 **UI/UX поліпшення** - Анімації, transitions
5. 🚀 **Production deploy** - Docker optimization

Ready to test! 🎯