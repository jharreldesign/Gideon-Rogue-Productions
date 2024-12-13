import React from 'react';
import Image from 'next/image'; 

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  imageSrc: string;
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, imageSrc }) => {
  if (!isOpen) return null; 

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 9999,
      }}
      onClick={onClose}
    >
      <div
        style={{
          position: 'relative',
          maxWidth: '90%',
          maxHeight: '90%',
          backgroundColor: 'white',
          padding: '10px',
        }}
        onClick={(e) => e.stopPropagation()} 
      >
        <Image
          src={imageSrc}
          alt="Tour Poster"
          layout="responsive" 
          width={1200} 
          height={800} 
          objectFit="contain" 
        />
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '10px',
            right: '10px',
            backgroundColor: 'red',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            padding: '5px 10px',
            cursor: 'pointer',
          }}
        >
          Close
        </button>
      </div>
    </div>
  );
};

export default Modal;
