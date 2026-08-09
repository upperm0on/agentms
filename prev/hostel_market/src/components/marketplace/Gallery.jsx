import React from 'react'
import './Gallery.css'

function Gallery({ images = [], alt, value, onChange }) {
  const safeImages = images.length ? images : ['/placeholder-product.jpg']
  const [current, setCurrent] = React.useState(value || safeImages[0])

  React.useEffect(() => {
    if (value) setCurrent(value)
  }, [value])

  const handleSelect = (src) => {
    setCurrent(src)
    onChange && onChange(src)
  }

  return (
    <div className="gallery">
      <div className="gallery-main" aria-live="polite">
        <img src={current} alt={alt} />
      </div>
      <div className="gallery-thumbs">
        {safeImages.slice(0, 6).map((src, i) => (
          <button
            key={i}
            className={`gallery-thumb${current === src ? ' active' : ''}`}
            onClick={() => handleSelect(src)}
            aria-label={`Select image ${i + 1}`}
          >
            <img src={src} alt="thumbnail" />
          </button>
        ))}
      </div>
    </div>
  )
}

export default Gallery


