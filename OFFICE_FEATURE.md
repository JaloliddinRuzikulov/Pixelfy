# Office Document Conversion Feature

## Overview
The Office feature allows users to convert PowerPoint (PPT/PPTX) and PDF documents into images that can be added to the video timeline. This feature integrates with the office service running in the `/office` folder.

## Features
- ✅ Upload PDF, PPT, and PPTX files
- ✅ Convert documents to high-quality PNG images
- ✅ Preview converted pages/slides
- ✅ Add individual pages or all pages to timeline
- ✅ Manage converted documents
- ✅ Beautiful UI with Uzbek language support

## Setup Instructions

### 1. Start the Office Service
```bash
# Navigate to office folder
cd office

# Make the script executable (first time only)
chmod +x start_service.sh

# Start the service
./start_service.sh
```

The service will run on http://localhost:8002

### 2. Configure Environment Variables
Add the following to your `.env` file in the web folder:
```env
OFFICE_SERVICE_URL=http://localhost:8002
```

### 3. Start the Web Application
```bash
cd web
npm run dev
```

## How to Use

1. **Open the Editor**: Navigate to the video editor in your browser
2. **Click Office Tab**: In the left sidebar, click on the "Office" tab
3. **Upload Document**: Click to select a PDF, PPT, or PPTX file (max 50MB)
4. **Convert**: Click "Konvertatsiya qilish" to convert the document
5. **Add to Timeline**:
   - Click on individual pages to preview
   - Use the layer icon to add single pages
   - Use "Barcha sahifalarni timeline'ga qo'shish" to add all pages

## Technical Details

### Architecture
```
User → Web App (Port 3000)
         ↓
    API Routes (/api/office/*)
         ↓
    Office Service (Port 8002)
         ↓
    LibreOffice/PDF Processing
```

### API Endpoints

#### Web API Endpoints (Port 3000)
- `POST /api/office/convert/pdf` - Convert PDF to images
- `POST /api/office/convert/powerpoint` - Convert PowerPoint to images
- `GET /api/office/download/:sessionId/:filename` - Download converted images
- `DELETE /api/office/cleanup/:sessionId` - Clean up session files

#### Office Service Endpoints (Port 8002)
- `POST /convert/pdf` - Direct PDF conversion
- `POST /convert/powerpoint` - Direct PowerPoint conversion
- `GET /download/:sessionId/:filename` - Get converted images
- `DELETE /cleanup/:sessionId` - Clean up session

### Component Structure
```
web/src/features/editor/
├── menu-item/
│   └── office.tsx           # Main Office component
├── components/
│   └── modern-sidebar.tsx   # Updated sidebar with Office tab
└── ...

web/src/app/api/office/
├── convert/
│   ├── pdf/route.ts         # PDF conversion endpoint
│   └── powerpoint/route.ts  # PowerPoint conversion endpoint
├── download/[...params]/route.ts  # Image download endpoint
└── cleanup/[sessionId]/route.ts   # Cleanup endpoint
```

### Features in Detail

#### File Upload
- Supports PDF, PPT, and PPTX files
- Maximum file size: 50MB
- Drag-and-drop or click to select
- File validation before upload

#### Conversion Process
- Converts documents to PNG images (150 DPI)
- Shows progress indicator during conversion
- Error handling with user-friendly messages
- Automatic cleanup of temporary files

#### Timeline Integration
- Each page/slide added as an image track item
- Default duration: 5 seconds per image
- Batch addition of all pages
- Individual page selection

#### Document Management
- View all converted documents
- Delete unwanted conversions
- Preview pages before adding
- Persistent within session

## UI/UX Features

### Modern Design
- Dark theme consistent with editor
- Card-based layout for better organization
- Smooth animations and transitions
- Responsive design

### User Feedback
- Loading states during conversion
- Progress indicators
- Success/error messages
- Tooltips and helpful descriptions

### Uzbek Language Support
- All UI text in Uzbek
- Clear action buttons
- Descriptive labels

## Troubleshooting

### Office Service Not Running
```bash
# Check if service is running
curl http://localhost:8002/health

# If not, start the service
cd office && ./start_service.sh
```

### Conversion Errors
- Ensure LibreOffice is installed (for PPT/PPTX)
- Check file size (max 50MB)
- Verify file format is supported

### Images Not Loading
- Check OFFICE_SERVICE_URL in .env
- Ensure both services are running
- Check browser console for errors

## Future Enhancements
- [ ] Support for more document formats (DOCX, ODT)
- [ ] Adjustable image quality settings
- [ ] Batch file upload
- [ ] OCR text extraction
- [ ] Animation preservation from PowerPoint
- [ ] Cloud storage integration
- [ ] Document templates library

## Development Notes

### Adding New Document Types
1. Update file validation in `office.tsx`
2. Add converter in `/office/app/services/`
3. Create API endpoint in `/web/src/app/api/office/`
4. Update UI to handle new type

### Customizing Conversion Settings
- Edit DPI in `office.tsx` (currently 150)
- Modify output format (PNG/JPEG)
- Adjust page ranges for partial conversion

### Performance Optimization
- Images are cached for 1 hour
- Session cleanup after use
- Lazy loading for previews
- Efficient batch operations