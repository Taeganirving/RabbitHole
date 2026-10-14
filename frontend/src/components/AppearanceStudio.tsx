
import { Palette, RotateCcw, X } from 'lucide-react'

export type BackgroundPreset =
  | 'void'
  | 'grid'
  | 'nebula'
  | 'energy'
  | 'emerald'

export type ColorPalette =
  | 'electric'
  | 'nebula'
  | 'emerald'
  | 'solar'

export interface AppearanceSettings {
  background: BackgroundPreset
  palette: ColorPalette
  lighting: number
  showGrid: boolean
  showParticles: boolean
  customBackground: string | null
  customAccent: string | null
  backgroundStyle: 'solid' | 'gradient'
  gradientStart: string
  gradientEnd: string
  gradientAngle: number
}

export const defaultAppearance: AppearanceSettings = {
  background: 'void',
  palette: 'electric',
  lighting: 65,
  showGrid: false,
  showParticles: true,
  customBackground: null,
  customAccent: null,
  backgroundStyle: 'solid',
  gradientStart: '#05070d',
  gradientEnd: '#192b4d',
  gradientAngle: 135,
}

export const backgroundColors: Record<BackgroundPreset, string> = {
  void: '#05070d',
  grid: '#080e20',
  nebula: '#190c2b',
  energy: '#1e090e',
  emerald: '#041a16',
}

export const paletteColors: Record<ColorPalette, string> = {
  electric: '#22d3ee',
  nebula: '#c084fc',
  emerald: '#34d399',
  solar: '#fbbf24',
}

interface Props {
  settings: AppearanceSettings
  onChange: (settings: AppearanceSettings) => void
  onClose: () => void
}

export default function AppearanceStudio({
  settings,
  onChange,
  onClose,
}: Props) {
  const update = (changes: Partial<AppearanceSettings>) => {
    onChange({ ...settings, ...changes })
  }

  const currentBackground =
    settings.customBackground ?? backgroundColors[settings.background]

  const currentAccent =
    settings.customAccent ?? paletteColors[settings.palette]

  return (
    <div className="appearance-studio">
      {/* Panel heading */}
      <div className="appearance-heading">
        <div>
          <Palette size={19} />
          <h2>Appearance Studio</h2>
        </div>

        <button
          type="button"
          onClick={onClose}
          aria-label="Close Appearance Studio"
        >
          <X size={18} />
        </button>
      </div>

      <p className="appearance-description">
        Customize your RabbitHole environment.
      </p>

      {/* Background presets */}
      <div className="appearance-section">
        <h3>BACKGROUND</h3>

        <div className="background-options">
          {(
            [
              ['void', 'Void'],
              ['grid', 'Cyber Grid'],
              ['nebula', 'Nebula'],
              ['energy', 'Dark Energy'],
              ['emerald', 'Emerald'],
            ] as const
          ).map(([value, label]) => (
            <button
              type="button"
              key={value}
              className={
                settings.background === value &&
                settings.customBackground === null
                  ? 'background-option selected'
                  : 'background-option'
              }
              onClick={() =>
                update({
                  background: value,
                  customBackground: null,
                })
              }
            >
              <span
                className="background-swatch"
                style={{
                  background: backgroundColors[value],
                }}
              />
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Color palette presets */}
      <div className="appearance-section">
        <h3>COLOR PALETTE</h3>

        <div className="palette-options">
          {(
            [
              ['electric', 'Electric'],
              ['nebula', 'Nebula'],
              ['emerald', 'Emerald'],
              ['solar', 'Solar'],
            ] as const
          ).map(([value, label]) => (
            <button
              type="button"
              key={value}
              className={
                settings.palette === value &&
                settings.customAccent === null
                  ? 'palette-option selected'
                  : 'palette-option'
              }
              onClick={() =>
                update({
                  palette: value,
                  customAccent: null,
                })
              }
            >
              <span
                className="palette-swatch"
                style={{
                  background: paletteColors[value],
                }}
              />
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Custom color pickers */}
      <div className="appearance-section">
        <h3>CUSTOM COLORS</h3>

        <div className="custom-color-row">
          <label htmlFor="custom-background">
            Background color
          </label>

          <input
            id="custom-background"
            type="color"
            value={currentBackground}
            onChange={(event) =>
              update({
                customBackground: event.target.value,
              })
            }
          />
        </div>

        <div className="custom-color-row">
          <label htmlFor="custom-accent">
            Accent color
          </label>

          <input
            id="custom-accent"
            type="color"
            value={currentAccent}
            onChange={(event) =>
              update({
                customAccent: event.target.value,
              })
            }
          />
        </div>
      </div>

{/* Background gradient controls */}
<div className="appearance-section">
  <h3>BACKGROUND STYLE</h3>

  <div className="mode-switcher">
    <button
      type="button"
      className={
        settings.backgroundStyle === 'solid'
          ? 'mode-button selected'
          : 'mode-button'
      }
      onClick={() => update({ backgroundStyle: 'solid' })}
    >
      Solid
    </button>

    <button
      type="button"
      className={
        settings.backgroundStyle === 'gradient'
          ? 'mode-button selected'
          : 'mode-button'
      }
      onClick={() => update({ backgroundStyle: 'gradient' })}
    >
      Gradient
    </button>
  </div>

  {settings.backgroundStyle === 'gradient' && (
    <div className="gradient-controls">
      <div className="custom-color-row">
        <label htmlFor="gradient-start">
          First color
        </label>
        <input
          id="gradient-start"
          type="color"
          value={settings.gradientStart}
          onChange={(event) =>
            update({ gradientStart: event.target.value })
          }
        />
      </div>

      <div className="custom-color-row">
        <label htmlFor="gradient-end">
          Second color
        </label>
        <input
          id="gradient-end"
          type="color"
          value={settings.gradientEnd}
          onChange={(event) =>
            update({ gradientEnd: event.target.value })
          }
        />
      </div>

      <div className="lighting-label">
        <span>Gradient direction</span>
        <span>{settings.gradientAngle}°</span>
      </div>

      <input
        type="range"
        min="0"
        max="360"
        step="5"
        value={settings.gradientAngle}
        onChange={(event) =>
          update({ gradientAngle: Number(event.target.value) })
        }
      />

      <div
        className="gradient-preview"
        style={{
          background: `linear-gradient(${settings.gradientAngle}deg, ${settings.gradientStart}, ${settings.gradientEnd})`,
        }}
      />
    </div>
  )}
</div>

      {/* Ambient lighting */}
      <div className="appearance-section">
        <h3>AMBIENT LIGHTING</h3>

        <div className="lighting-label">
          <span>Glow intensity</span>
          <span>{settings.lighting}%</span>
        </div>

        <input
          type="range"
          min="0"
          max="100"
          value={settings.lighting}
          onChange={(event) =>
            update({
              lighting: Number(event.target.value),
            })
          }
        />
      </div>

      {/* Display options */}
      <div className="appearance-section">
        <label className="appearance-toggle">
          <span>Background grid</span>

          <input
            type="checkbox"
            checked={settings.showGrid}
            onChange={(event) =>
              update({
                showGrid: event.target.checked,
              })
            }
          />
        </label>

        <label className="appearance-toggle">
          <span>Ambient particles</span>

          <input
            type="checkbox"
            checked={settings.showParticles}
            onChange={(event) =>
              update({
                showParticles: event.target.checked,
              })
            }
          />
        </label>
      </div>

      {/* Reset */}
      <button
        type="button"
        className="reset-appearance"
        onClick={() =>
          onChange({ ...defaultAppearance })
        }
      >
        <RotateCcw size={15} />
        Reset to defaults
      </button>
    </div>
  )
}
