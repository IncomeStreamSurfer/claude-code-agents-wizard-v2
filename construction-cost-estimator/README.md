# Construction Cost Estimator

A React + TypeScript application for analyzing construction PDFs and estimating costs.

## Tech Stack

- **React 19.2.0** - UI framework
- **TypeScript 5.9.3** - Type safety
- **Vite 7.2.2** - Build tool and dev server
- **Tailwind CSS 3.4.18** - Styling
- **shadcn/ui** - UI components (configured, components not yet added)
- **pdfjs-dist 5.4.394** - PDF rendering
- **react-konva 19.2.0** - Canvas-based annotation layer
- **zustand 5.0.8** - State management

## Project Structure

```
src/
├── components/     # React components
├── store/          # Zustand state stores
├── utils/          # Utility functions (including cn helper)
├── types/          # TypeScript type definitions
│   └── index.ts    # PDFPage, Annotation, Label, CostItem types
├── App.tsx         # Main application component
├── App.css         # App-specific styles
├── index.css       # Tailwind directives and CSS variables
└── main.tsx        # Application entry point
```

## Getting Started

### Installation

Dependencies are already installed. If you need to reinstall:

```bash
npm install
```

### Development

Start the development server:

```bash
npm run dev
```

The application will be available at [http://localhost:5173](http://localhost:5173)

### Build

Build for production:

```bash
npm run build
```

### Preview Production Build

```bash
npm run preview
```

## Type Definitions

The project includes TypeScript interfaces for core domain models:

- **PDFPage** - Represents a single PDF page with dimensions and image data
- **Annotation** - Markup elements for highlighting and annotating PDF content
- **Label** - Categories for organizing annotations and cost items
- **CostItem** - Cost line items extracted from the PDF
- **Project** - Project metadata and PDF information

## Configuration

### Tailwind CSS

Configured with shadcn/ui color variables and responsive design utilities. See `tailwind.config.js` for customization.

### Path Aliases

The project uses `@/` as an alias for the `src/` directory:

```typescript
import { cn } from '@/utils/cn'
import type { PDFPage } from '@/types'
```

### shadcn/ui

Configured via `components.json`. To add components:

```bash
npx shadcn@latest add button
npx shadcn@latest add card
```

## Next Steps

1. Implement PDF viewer component
2. Create annotation tools
3. Build cost extraction UI
4. Set up Zustand stores for state management
5. Add more shadcn/ui components as needed
