interface ModuleBannerProps {
  src:  string;
  alt?: string;
}

/**
 * Banner visual exibido abaixo do título nas páginas de módulo.
 * Se a imagem não carregar, o componente se oculta silenciosamente.
 */
export default function ModuleBanner({ src, alt = "Banner" }: ModuleBannerProps) {
  return (
    <div className="max-w-md mx-auto px-5 pb-1">
      <img
        src={src}
        alt={alt}
        className="w-full rounded-2xl"
        style={{ objectFit: "cover", display: "block" }}
        onError={(e) => {
          e.currentTarget.parentElement!.style.display = "none";
        }}
      />
    </div>
  );
}
