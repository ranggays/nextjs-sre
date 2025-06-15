'use client';

import { timeStamp } from 'console';
import { useEffect, useRef } from 'react';
import { Core } from '@pdftron/webviewer';

interface WebViewerProps{
  fileUrl: string,
  path: string,
  initialDoc: string,
  licenseKey?: string,
  onAnalytics?: (data: any) => void,
}

export default function WebViewer({fileUrl, path, initialDoc, licenseKey, onAnalytics}: WebViewerProps) {
    const viewer = useRef<HTMLDivElement | null>(null);
    const instanceRef = useRef<any>(null);
    const startTime = useRef<number>(Date.now());
    const eventListenersRef = useRef<any[]>([]);

    useEffect(() => {
      let mounted = true;
      
      // Clean up any existing instance first
      if (instanceRef.current?.UI) {
        instanceRef.current.UI.dispose();
        instanceRef.current = null;
      }
      
      // Clear previous event listeners
      eventListenersRef.current = [];
      
      if (!viewer.current) return;
      viewer.current.innerHTML = '';

      const initializeViewer = async () => {
        const module = await import('@pdftron/webviewer');
        const WebViewer = module.default;
        
        if (!mounted) return;

        const instance = await WebViewer(
          {
            path: path || '/lib/webviewer',
            licenseKey: licenseKey || process.env.LICENSE_KEY_PDF,
            initialDoc: initialDoc || fileUrl,
            enableAnnotations: true,
            enableMeasurement: true,
            annotationUser: 'Rangga',
            fullAPI: true,
          },
          viewer.current!
        ).then((instance : any) => {
          const { documentViewer, annotationManager} = instance.Core;

          let documentLoadedAt = Date.now();
          let isProcessingAnnotation = false; // Flag untuk mencegah duplikasi

          // Document loaded event
          const onDocumentLoaded = () => {
            documentLoadedAt = Date.now();
            console.log('Document loaded!');
            onAnalytics?.({
              action: 'document_loaded',
              document: initialDoc,
              timestamp: new Date().toISOString(),
              totalPages: documentViewer.getPageCount()
            });
          };

          // Page number updated event
          const onPageNumberUpdated = (pageNumber: number) => {
            console.log('Page Number updated!', pageNumber);
            onAnalytics?.({
              action: 'page_viewed',
              document: initialDoc,
              pageNumber,
              timeStamp: new Date().toISOString()
            });
          };

          // Text selected event
          const onTextSelected = (quads: any, selectedText: string) => {
            onAnalytics?.({
              action: 'text_selected',
              document: initialDoc,
              selectedText: selectedText.substring(0, 100),
              timeStamp: new Date().toISOString()
            });
          };

          // Annotation changed event with deduplication
          const onAnnotationChanged = async (annotations: any, action: string) => {
            if (!['add', 'modify', 'delete'].includes(action)) return;
            if (isProcessingAnnotation) return; // Prevent duplicate processing

            const now = Date.now();
            if (now - documentLoadedAt < 2000) return; // skip auto-load annotations

            isProcessingAnnotation = true;

            try {
              for (const ann of annotations) {
                if (!ann || ann.Imported) continue;

                const contents = ann.getContents?.() || '';

                // Lewati highlight tanpa isi komentar
                if (
                  (ann.Subject === 'Highlight' || ann.getCustomData?.('type') === 'Highlight') &&
                  !contents
                ) {
                  continue;
                }

                onAnalytics?.({
                  action: 'annotation_' + action,
                  document: initialDoc,
                  metadata: {
                    annotationType: ann.Subject || ann.getCustomData?.('type') || 'unknown',
                    contents,
                    pageNumber: ann.PageNumber,
                    rect: ann.getRect?.(),
                    author: ann.Author,
                    annotationId: ann.Id, // Tambahkan ID untuk tracking
                  },
                  timeStamp: new Date().toISOString(),
                });
              }
            } finally {
              // Reset flag setelah delay singkat
              setTimeout(() => {
                isProcessingAnnotation = false;
              }, 100);
            }
          };

          // Search term submitted event
          const onSearchTermSubmitted = (searchTerm: string) => {
            onAnalytics?.({
              action: 'search_performed',
              document: initialDoc,
              searchTerm,
              timeStamp: new Date().toISOString()
            });
          };

          // Download pressed event
          const onDownloadPressed = () => {
            onAnalytics?.({
              action: 'document_downloaded',
              document: initialDoc,
              timeStamp: new Date().toISOString()
            });
          };

          // Add event listeners
          documentViewer.addEventListener('documentLoaded', onDocumentLoaded);
          documentViewer.addEventListener('pageNumberUpdated', onPageNumberUpdated);
          documentViewer.addEventListener('textSelected', onTextSelected);
          annotationManager.addEventListener('annotationChanged', onAnnotationChanged);
          instance.UI.addEventListener('searchTermSubmitted', onSearchTermSubmitted);
          instance.UI.addEventListener('downloadPressed', onDownloadPressed);

          // Store event listeners for cleanup
          eventListenersRef.current = [
            { target: documentViewer, event: 'documentLoaded', handler: onDocumentLoaded },
            { target: documentViewer, event: 'pageNumberUpdated', handler: onPageNumberUpdated },
            { target: documentViewer, event: 'textSelected', handler: onTextSelected },
            { target: annotationManager, event: 'annotationChanged', handler: onAnnotationChanged },
            { target: instance.UI, event: 'searchTermSubmitted', handler: onSearchTermSubmitted },
            { target: instance.UI, event: 'downloadPressed', handler: onDownloadPressed },
          ];

          /*ZOOM
          const onZoomUpdated = (zoom: number) => {
            onAnalytics?.({
              action: 'zoom_changed',
              document: initialDoc,
              zoomLevel: zoom,
              timestamp: new Date().toISOString()
            });
          };
          documentViewer.addEventListener('zoomUpdated', onZoomUpdated);
          eventListenersRef.current.push({ target: documentViewer, event: 'zoomUpdated', handler: onZoomUpdated });
          */

          /*PRINT
          const onPrintPressed = () => {
            onAnalytics?.({
              action: 'document_printed',
              document: initialDoc,
              timeStamp: new Date().toISOString()
            });
          };
          instance.UI.addEventListener('printPressed', onPrintPressed);
          eventListenersRef.current.push({ target: instance.UI, event: 'printPressed', handler: onPrintPressed });
          */

          return instance;
        });

        if (mounted) {
          instanceRef.current = instance;
        }
      };

      initializeViewer().catch(console.error);

      return () => {
        mounted = false;
        
        // Clean up event listeners
        eventListenersRef.current.forEach(({ target, event, handler }) => {
          if (target && target.removeEventListener) {
            target.removeEventListener(event, handler);
          }
        });
        eventListenersRef.current = [];
        
        if (instanceRef.current?.UI) {
          instanceRef.current.UI.dispose();
          instanceRef.current = null;
        }
        
        if (viewer.current) {
          viewer.current.innerHTML = '';
        }
        
        const sessionTime = Date.now() - startTime.current;
        onAnalytics?.({
          action: 'session_ended',
          document: initialDoc,
          sessionDuration: sessionTime,
          timestamp: new Date().toISOString()
        });
      };
    }, [fileUrl, path, initialDoc, licenseKey, onAnalytics]);

    return (
      <div className="webviewer" ref={viewer} style={{height: "100%", minHeight: 0, width: "100%"}}></div>
    );
}