import React from "react";

export default function ImageWithLoader({
  src,
  alt = "",
  className = "",
  containerClassName = "",
  fit = "cover",
  eager = false,
  fallbackUrl,
}) {
  const [loaded, setLoaded] = React.useState(false);
  const [error, setError] = React.useState(false);

  React.useEffect(() => {
    if (!src) return;
    setLoaded(false);
    setError(false);
    const img = new Image();
    img.decoding = "async";
    img.onload = () => setLoaded(true);
    img.onerror = () => setError(true);
    img.src = src;
    // If cached, onload may not fire in some browsers
    if (img.complete) setLoaded(true);
    return () => {
      img.onload = null;
      img.onerror = null;
    };
  }, [src]);

  const finalSrc = !error ? src : (fallbackUrl || "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=800&q=60");

  return (
    <div className={`relative ${containerClassName}`}>
      {!loaded && (
        <div className="absolute inset-0 animate-pulse bg-gray-100 rounded-lg" />
      )}
      {finalSrc && (
        <img
          src={finalSrc}
          alt={alt}
          loading={eager ? "eager" : "lazy"}
          decoding="async"
          onLoad={() => setLoaded(true)}
          onError={() => setError(true)}
          style={{ objectFit: fit, visibility: loaded ? "visible" : "hidden" }}
          className={className}
        />
      )}
    </div>
  );
}