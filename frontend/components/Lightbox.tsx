import { isVideo, type Photo } from './photo'

/** Shared full-screen overlay for images, GIFs, and videos. */
export default function Lightbox({ photo, onClose }: { photo: Photo | null; onClose: () => void }) {
  if (!photo) return null

  const mediaStyle: React.CSSProperties = {
    maxWidth: '100%',
    maxHeight: '80vh',
    objectFit: 'contain',
    borderRadius: '12px',
    boxShadow: '0 12px 48px rgba(0,0,0,0.5)',
  }

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.82)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '14px',
        padding: '5vw',
        zIndex: 2000,
        cursor: 'zoom-out',
        animation: 'fadeIn 0.2s ease',
      }}
    >
      {isVideo(photo) ? (
        <video
          src={photo.src}
          controls
          autoPlay
          loop
          playsInline
          onClick={(e) => e.stopPropagation()}
          style={mediaStyle}
        />
      ) : (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={photo.src} alt={photo.alt} style={mediaStyle} />
      )}
      {photo.caption && (
        <p style={{ color: '#fff', fontSize: '0.9375rem', margin: 0, textAlign: 'center', maxWidth: '600px' }}>
          {photo.caption}
        </p>
      )}
    </div>
  )
}
