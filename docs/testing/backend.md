# 🧪 Backend Testing Guide

## Quick Start

### 1. Автоматичний запуск (рекомендований)
```bash
# Зробити скрипт виконуваним
chmod +x setup_and_test.sh

# Повний автоматичний setup + тестування
./setup_and_test.sh setup
```

### 2. Інтерактивне меню
```bash
# Запустити інтерактивне меню
./setup_and_test.sh menu
```

### 3. Ручний запуск
```bash
# 1. Створити .env файл
cp .env.example .env

# 2. Запустити сервіси
docker-compose up -d

# 3. Дочекатися готовності (2-3 хвилини)
docker-compose logs -f backend

# 4. Запустити тести
python test_backend.py
```

## Що тестується

### ✅ Базові endpoints:
- **Health check**: `/health`
- **Detailed health**: `/health/detailed`
- **Algorithms list**: `/api/v1/segmentation/algorithms`

### ✅ Image workflow:
- **Image upload**: `/api/v1/images/upload`
- **Image processing**: Створення тестового зображення

### ✅ Segmentation:
- **Felzenszwalb algorithm**: Тестування з базовими параметрами
- **SLIC algorithm**: Тестування з базовими параметрами
- **Performance metrics**: Час обробки, кількість сегментів

### ✅ WebSocket:
- **Connection**: Підключення до WebSocket
- **Ping/Pong**: Тестування зв'язку

## Очікувані результати

При успішному тестуванні ви побачите:

```
🧪 Backend Testing Suite
==================================================
🏥 Testing health check...
✅ Health check passed: healthy

🔍 Testing detailed health check...
✅ Detailed health check passed
   CPU: 15.2%
   Memory: 45.8%

🧮 Testing algorithms endpoint...
✅ Found 4 algorithms:
   - Felzenszwalb (felzenszwalb)
   - SLIC (slic)
   - Quickshift (quickshift)
   - Watershed (watershed)

📤 Testing image upload...
✅ Image uploaded successfully
   ID: 12345678-1234-5678-9abc-123456789abc
   Dimensions: [200, 200]
   Size: 2048 bytes

🎨 Testing segmentation...
   Sending segmentation request...
✅ Segmentation completed in 2.34s
   Request ID: 87654321-4321-8765-cba9-987654321cba
   Results count: 2
   - felzenszwalb: 45 segments (1.23s)
   - slic: 52 segments (1.11s)

🔌 Testing WebSocket connection...
✅ WebSocket connected
   Sent ping message
   Received: pong

==================================================
🏁 TEST SUMMARY
==================================================
✅ PASS      Health Check
✅ PASS      Detailed Health
✅ PASS      Algorithms Endpoint
✅ PASS      Image Upload
✅ PASS      Segmentation
✅ PASS      WebSocket

Passed: 6/6 tests
🎉 All tests passed! Backend is working correctly.
```

## Troubleshooting

### Проблема: Сервіси не запускаються
```bash
# Перевірити статус
docker-compose ps

# Переглянути логи
docker-compose logs backend
docker-compose logs redis
docker-compose logs postgres
```

### Проблема: Backend не відповідає
```bash
# Перевірити порти
netstat -tlnp | grep :8000

# Перевірити Docker мережу
docker network ls
docker network inspect image-segmentation-service_segmentation_network
```

### Проблема: Алгоритми не працюють
```bash
# Перевірити Python dependencies
docker-compose exec backend pip list | grep scikit-image

# Тестувати окремо
docker-compose exec backend python -c "from skimage.segmentation import felzenszwalb; print('OK')"
```

### Проблема: Redis/PostgreSQL недоступні
```bash
# Тестувати Redis
docker-compose exec redis redis-cli ping

# Тестувати PostgreSQL
docker-compose exec postgres pg_isready -U segmentation_user
```

## Детальне налагодження

### 1. Перегляд логів у real-time
```bash
# Всі сервіси
docker-compose logs -f

# Тільки backend
docker-compose logs -f backend

# З часовими мітками
docker-compose logs -f -t backend
```

### 2. Підключення до контейнерів
```bash
# Backend container
docker-compose exec backend bash

# Redis container
docker-compose exec redis redis-cli

# PostgreSQL container
docker-compose exec postgres psql -U segmentation_user -d segmentation_db
```

### 3. Перевірка ресурсів
```bash
# Використання ресурсів
docker stats

# Детальна інформація
docker-compose exec backend top
```

### 4. Ручне тестування API
```bash
# Health check
curl http://localhost:8000/health

# Algorithms list
curl http://localhost:8000/api/v1/segmentation/algorithms

# Upload test (з файлом)
curl -X POST -F "file=@test_image.png" http://localhost:8000/api/v1/images/upload
```

## Наступні кроки

Після успішного тестування backend:

1. ✅ **Backend працює** - всі endpoint доступні
2. 🔄 **Frontend розробка** - створення React компонентів
3. 🔗 **Інтеграція** - з'єднання frontend з backend
4. 🎨 **UI/UX** - покращення інтерфейсу
5. 🚀 **Production** - підготовка до deploy

Готовий продовжувати? 🎯