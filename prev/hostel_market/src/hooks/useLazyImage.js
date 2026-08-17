import { useState, useEffect, useRef } from 'react'

/**
 * Custom hook for lazy loading images using Intersection Observer
 * 
 * @param {string} src - Image source URL
 * @param {string} placeholder - Placeholder image URL (optional)
 * @param {object} options - Intersection Observer options
 * @returns {object} { imageSrc, isLoaded, isInView, ref }
 * 
 * @example
 * const { imageSrc, isLoaded, isInView, ref } = useLazyImage(product.primary_image)
 * 
 * <img ref={ref} src={imageSrc} alt={product.name} />
 */
export function useLazyImage(src, placeholder = null, options = {}) {
  const [imageSrc, setImageSrc] = useState(placeholder || src)
  const [isLoaded, setIsLoaded] = useState(false)
  const [isInView, setIsInView] = useState(false)
  const imgRef = useRef(null)
  const observerRef = useRef(null)

  useEffect(() => {
    // If no src, don't set up observer
    if (!src) {
      return
    }

    // If Intersection Observer is not supported, load image immediately
    if (!window.IntersectionObserver) {
      setImageSrc(src)
      setIsInView(true)
      return
    }

    // Set up Intersection Observer
    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsInView(true)
            setImageSrc(src)
            
            // Disconnect observer once image is in view
            if (observerRef.current && imgRef.current) {
              observerRef.current.unobserve(imgRef.current)
            }
          }
        })
      },
      {
        rootMargin: '50px', // Start loading 50px before image enters viewport
        threshold: 0.01,
        ...options,
      }
    )

    // Observe the image element
    if (imgRef.current) {
      observerRef.current.observe(imgRef.current)
    }

    // Cleanup
    return () => {
      if (observerRef.current && imgRef.current) {
        observerRef.current.unobserve(imgRef.current)
      }
      if (observerRef.current) {
        observerRef.current.disconnect()
      }
    }
  }, [src, options])

  // Handle image load event
  const handleLoad = () => {
    setIsLoaded(true)
  }

  // Handle image error
  const handleError = () => {
    // Fallback to placeholder if image fails to load
    if (placeholder && imageSrc !== placeholder) {
      setImageSrc(placeholder)
    }
  }

  return {
    imageSrc,
    isLoaded,
    isInView,
    ref: imgRef,
    onLoad: handleLoad,
    onError: handleError,
  }
}

