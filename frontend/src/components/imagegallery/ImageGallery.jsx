import { useState } from "react";
import "./ImageGallery.css";

export default function ImageGallery({ images = [] }) {
    const [activeIndex, setActiveIndex] = useState(0);

    if (images.length === 0) {
        return <div className="gallery-placeholder">No images provided</div>;
    }

    return (
        <div className="image-gallery">
            <div className="gallery-main">
                <img src={images[activeIndex]} alt={`Auction image ${activeIndex + 1}`} />
            </div>

            {images.length > 1 && (
                <div className="gallery-thumbs">
                    {images.map((img, i) => (
                        <button
                            key={i}
                            className={`gallery-thumb ${i === activeIndex ? "active" : ""}`}
                            onClick={() => setActiveIndex(i)}
                        >
                            <img src={img} alt={`Thumbnail ${i + 1}`} />
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}