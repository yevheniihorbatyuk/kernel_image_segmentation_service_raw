# 🎨 Image Segmentation Service

A modern, high-performance web service for image segmentation with multiple algorithms, real-time parameter tuning, and interactive comparison views.

## ✨ Features

### 🔥 Core Functionality
- **Multiple Segmentation Algorithms**: Felzenszwalb, SLIC, Quickshift, Watershed
- **Real-time Parameter Tuning**: WebSocket-based live updates
- **Flexible View Modes**: Single, Split, 2x2 Grid comparison
- **Intelligent Caching**: Redis-powered result caching
- **Performance Metrics**: Processing time, memory usage, segment analysis

### 🎯 Advanced Features
- **Interactive Comparison**: Side-by-side and grid view comparisons
- **Batch Processing**: Multiple images simultaneously
- **Export Functionality**: PNG, masks, parameter configurations
- **Dynamic Algorithm Management**: Add/remove algorithms on-the-fly
- **Performance Profiling**: Detailed metrics for each algorithm

### 🚀 Technical Highlights
- **FastAPI Backend**: Modern, async Python framework
- **React Frontend**: TypeScript + Material-UI
- **WebSocket Real-time**: Live parameter updates
- **Docker Containerized**: Complete containerization
- **Microservice Ready**: Scalable architecture
- **Production Ready**: Health checks, monitoring, logging

## 🏗️ Architecture

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   React UI      │────│   FastAPI        │────│   ML Pipeline  │
│   - Multi-view  │    │   - WebSockets   │    │   - 4 Algorithms│
│   - Real-time   │    │   - REST API     │    │   - Metrics     │
│   - Interactive │    │   - Validation   │    │   - Caching     │
└─────────────────┘    └──────────────────┘    └─────────────────┘
         │                        │                        │
         │                        │                        │
    ┌─────────┐            ┌─────────────┐         ┌──────────────┐
    │Material │            │    Redis    │         │ Image Storage│
    │   UI    │            │   Cache     │         │   & Utils    │
    └─────────┘            └─────────────┘         └──────────────┘
```

## 🛠️ Tech Stack

### Backend
- **FastAPI** 0.104+ - Modern async Python framework
- **Pydantic** 2.5+ - Data validation and serialization
- **scikit-image** - Image segmentation algorithms
- **OpenCV** - Computer vision utilities
- **Redis** - Caching and session storage
- **PostgreSQL** - Metadata storage (optional)
- **WebSockets** - Real-time communication
- **Structured Logging** - Comprehensive monitoring

### Frontend
- **React** 18+ with TypeScript
- **Material-UI** (MUI) - Modern component library
- **Zustand** - Lightweight state management
- **WebSocket Client** - Real-time updates
- **Custom Hooks** - Reusable business logic

### DevOps
- **Docker** & **Docker Compose** - Containerization
- **Multi-stage builds** - Optimized images
- **Health checks** - Service monitoring
- **Volume mounting** - Development workflow

## 🚀 Quick Start

### Prerequisites
- Docker & Docker Compose
- 8GB+ RAM (for ML processing)
- Modern browser with WebSocket support

### 1. Clone and Setup
```bash
git clone <repository-url>
cd image-segmentation-service

# Copy environment file
cp .env.example .env

# Edit .env with your configurations (optional for development)
nano .env
```

### 2. Start Services
```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Check service health
curl http://localhost:8000/health
```

### 3. Access Application
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000
- **API Documentation**: http://localhost:8000/docs
- **Interactive API**: http://localhost:8000/redoc

## 📚 Usage Guide

### Basic Usage
1. **Upload Image**: Drag & drop or click to upload
2. **Select Algorithms**: Choose from Felzenszwalb, SLIC, Quickshift, Watershed
3. **Adjust Parameters**: Use sliders for real-time tuning
4. **Compare Results**: Switch between Single, Split, and Grid views
5. **Export Results**: Download segmented images and configurations

### Advanced Features

#### Multi-Algorithm Comparison
```typescript
// Select multiple algorithms for comparison
const algorithms = [
  { name: 'felzenszwalb', parameters: { scale: 100, sigma: 0.5 } },
  { name: 'slic', parameters: { n_segments: 250, compactness: 10 } }
];
```

#### Real-time Parameter Updates
```typescript
// WebSocket connection for live updates
const ws = new WebSocket('ws://localhost:8000/api/v1/ws/segment');
ws.send(JSON.stringify({
  type: 'parameter_update',
  algorithm: 'felzenszwalb',
  parameter: 'scale',
  value: 150
}));
```

#### View Modes
- **Single View**: Focus on one algorithm result
- **Split View**: Original vs. segmented side-by-side
- **Grid 2x2**: Compare up to 4 algorithms simultaneously

## 🎛️ Algorithm Parameters

### Felzenszwalb
- **Scale** (10-1000): Controls segment size
- **Sigma** (0.1-2.0): Gaussian smoothing
- **Min Size** (10-500): Minimum segment size

### SLIC (Simple Linear Iterative Clustering)
- **N Segments** (50-1000): Target number of superpixels
- **Compactness** (1-50): Shape vs. color importance
- **Sigma** (0-5): Gaussian smoothing

### Quickshift
- **Kernel Size** (1-10): Local neighborhood size
- **Max Distance** (1-20): Maximum feature distance
- **Ratio** (0.1-1.0): Distance ratio threshold

### Watershed
- **Markers** (50-1000): Number of watershed markers
- **Compactness** (0-1): Boundary compactness

## 🔧 Development

### Backend Development
```bash
# Enter backend container
docker-compose exec backend bash

# Install additional packages
pip install package-name

# Run tests
pytest

# Type checking
mypy app/

# Code formatting
black app/
isort app/
```

### Frontend Development
```bash
# Enter frontend container
docker-compose exec frontend bash

# Install packages
npm install package-name

# Run tests
npm test

# Type checking
npm run type-check

# Linting
npm run lint
```

### Adding New Algorithms

1. **Create Algorithm Class**:
```python
# app/ml/algorithms/new_algorithm.py
from .base import BaseSegmentationAlgorithm

class NewAlgorithm(BaseSegmentationAlgorithm):
    def __init__(self):
        super().__init__("new_algo", "New Algorithm")
    
    def get_default_parameters(self):
        return {"param1": 10, "param2": 0.5}
    
    def segment(self, image, parameters):
        # Implementation here
        pass
```

2. **Register Algorithm**:
```python
# app/ml/algorithms/__init__.py
from .new_algorithm import NewAlgorithm

ALGORITHM_REGISTRY = {
    # ... existing algorithms
    "new_algo": NewAlgorithm
}
```

## 📊 API Documentation

### REST Endpoints

#### Images
- `POST /api/v1/images/upload` - Upload image
- `GET /api/v1/images/info/{image_id}` - Get image info

#### Segmentation
- `GET /api/v1/segmentation/algorithms` - List algorithms
- `POST /api/v1/segmentation/segment` - Segment image
- `POST /api/v1/segmentation/batch` - Batch processing

#### WebSocket
- `WS /api/v1/ws/{connection_id}` - Real-time updates

### WebSocket Messages

#### Parameter Update
```json
{
  "type": "parameter_update",
  "algorithm_name": "felzenszwalb",
  "parameter_name": "scale",
  "parameter_value": 150,
  "image_id": "uuid"
}
```

#### Segmentation Progress
```json
{
  "type": "segmentation_progress",
  "algorithm_name": "slic",
  "progress_percent": 45.5,
  "estimated_time_remaining": 2.3
}
```

## 🐳 Docker Configuration

### Development
```bash
# Development with hot reload
docker-compose up

# Rebuild specific service
docker-compose build backend
docker-compose up -d backend
```

### Production
```bash
# Production deployment
docker-compose -f docker-compose.prod.yml up -d

# Scale services
docker-compose up -d --scale backend=3
```

## 🔍 Monitoring & Debugging

### Health Checks
- **Basic**: `GET /health`
- **Detailed**: `GET /health/detailed`

### Logs
```bash
# View all logs
docker-compose logs -f

# Service-specific logs
docker-compose logs -f backend
docker-compose logs -f frontend
```

### Performance Monitoring
- Memory usage per algorithm
- Processing time metrics
- Cache hit rates
- WebSocket connection stats

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

### Code Standards
- **Backend**: Black formatting, type hints, docstrings
- **Frontend**: ESLint + Prettier, TypeScript strict mode
- **Tests**: Minimum 80% coverage
- **Documentation**: Update README for new features

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **scikit-image** team for excellent segmentation algorithms
- **FastAPI** for the modern Python framework
- **React** community for the frontend ecosystem
- **Docker** for containerization capabilities

---

**🌾Built for Kernel Holding S.A.**