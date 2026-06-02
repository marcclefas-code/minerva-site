/* Minerva — Tweaks: motto typography (home page) */
const MOTTO_FONTS = {
  'Cormorant Garamond': "'Cormorant Garamond', Georgia, serif",
  'Spectral': "'Spectral', Georgia, serif",
  'Georgia': "Georgia, 'Times New Roman', serif",
  'Archivo Sans': "'Archivo', system-ui, sans-serif",
  'JetBrains Mono': "'JetBrains Mono', ui-monospace, monospace"
};
const MOTTO_COLORS = {
  'Atelier Silver': 'var(--platinum)',
  'Bright': 'var(--platinum-bright)',
  'Dim': 'var(--fg-dim)',
  'Sovereign Gold': '#C9A24B'
};

const MOTTO_DEFAULTS = /*EDITMODE-BEGIN*/{
  "fontName": "Cormorant Garamond",
  "italic": false,
  "size": 31,
  "weight": "400",
  "spacing": 6,
  "transform": "none",
  "colorName": "Atelier Silver",
  "marginTop": 36
}/*EDITMODE-END*/;

function MottoTweaks() {
  const [t, setTweak] = useTweaks(MOTTO_DEFAULTS);

  React.useEffect(() => {
    const r = document.documentElement.style;
    r.setProperty('--motto-font', MOTTO_FONTS[t.fontName] || MOTTO_FONTS['Cormorant Garamond']);
    r.setProperty('--motto-weight', String(t.weight));
    r.setProperty('--motto-size', t.size + 'px');
    r.setProperty('--motto-style', t.italic ? 'italic' : 'normal');
    r.setProperty('--motto-spacing', (t.spacing / 100) + 'em');
    r.setProperty('--motto-color', MOTTO_COLORS[t.colorName] || MOTTO_COLORS['Atelier Silver']);
    r.setProperty('--motto-transform', t.transform);
    r.setProperty('--motto-mt', t.marginTop + 'px');
  }, [t]);

  return (
    <TweaksPanel title="Tweaks">
      <TweakSection label="Motto — Typeface" />
      <TweakSelect label="Font" value={t.fontName}
        options={Object.keys(MOTTO_FONTS)}
        onChange={(v) => setTweak('fontName', v)} />
      <TweakRadio label="Weight" value={t.weight}
        options={['300', '400', '500']}
        onChange={(v) => setTweak('weight', v)} />
      <TweakToggle label="Italic" value={t.italic}
        onChange={(v) => setTweak('italic', v)} />
      <TweakRadio label="Case" value={t.transform}
        options={['none', 'uppercase']}
        onChange={(v) => setTweak('transform', v)} />

      <TweakSection label="Motto — Size & Spacing" />
      <TweakSlider label="Size" value={t.size} min={16} max={64} step={1} unit="px"
        onChange={(v) => setTweak('size', v)} />
      <TweakSlider label="Letter-spacing" value={t.spacing} min={0} max={40} step={1} unit="·0.01em"
        onChange={(v) => setTweak('spacing', v)} />
      <TweakSlider label="Move down" value={t.marginTop} min={0} max={140} step={2} unit="px"
        onChange={(v) => setTweak('marginTop', v)} />

      <TweakSection label="Motto — Colour" />
      <TweakSelect label="Colour" value={t.colorName}
        options={Object.keys(MOTTO_COLORS)}
        onChange={(v) => setTweak('colorName', v)} />
    </TweaksPanel>
  );
}

ReactDOM.createRoot(document.getElementById('tweaksRoot')).render(<MottoTweaks />);
