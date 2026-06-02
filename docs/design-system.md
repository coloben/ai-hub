# AI Hub — Design System "Neo-Cyan"

> **RÈGLE D'OR** : Toute nouvelle page, composant ou feature doit respecter intégralement ce document. Aucune exception. Aucune couleur hardcodée. Aucun style inline.

---

## 1. Identité Visuelle

**Nom** : Neo-Cyan  
**Positionnement** : Tech, AI-native, moderne, communautaire  
**Inspirations** : Linear (spotlight), Vercel (density), Discord (micro-interactions), Reddit (engagement binaire)

---

## 2. Palette (CSS Variables uniquement)

### Fond
| Token | Valeur | Usage |
|---|---|---|
| `--background` | `#06060a` | Fond global, plus profond que le noir pur |
| `--card` | `#0e0e14` | Surfaces cards, popover |
| `--card-hover` | `#13131c` | Surfaces au hover |

### Texte
| Token | Valeur | Usage |
|---|---|---|
| `--foreground` | `rgba(255,255,255,0.92)` | Texte principal |
| `--muted-foreground` | `rgba(255,255,255,0.40)` | Texte secondaire, métadonnées |

### Accents
| Token | Valeur | Usage |
|---|---|---|
| `--accent` | `#00d4aa` | Primaire : liens actifs, badges, indicateurs |
| `--accent-dim` | `rgba(0,212,170,0.10)` | Fond hover accent |
| `--accent-glow` | `rgba(0,212,170,0.30)` | Glows, halos |
| `--accent-2` | `#3b82f6` | Secondaire : gradient, hover states |
| `--accent-2-dim` | `rgba(59,130,246,0.10)` | Fond hover secondaire |

### Sémantique
| Token | Valeur | Usage |
|---|---|---|
| `--border` | `rgba(255,255,255,0.05)` | Bordures par défaut |
| `--border-hover` | `rgba(0,212,170,0.15)` | Bordures au hover |
| `--success` | `#4ade80` | Indicateurs positifs, deltas |
| `--destructive` | `#f87171` | Erreurs, downvotes |
| `--ring` | `#00d4aa` | Focus visible |

---

## 3. Typographie

| Usage | Police | Taille | Poids | Tracking |
|---|---|---|---|---|
| Body | Inter | 14px | 400 | normal |
| Titres | Inter | 20-32px | 700-800 | -0.02em |
| Data / chiffres | JetBrains Mono | variable | 700 | -0.02em |
| Labels / caps | Inter | 10-11px | 600-700 | 0.1em |

**Règle** : Jamais de taille > 32px. La density prime sur la taille.

---

## 4. Layout & Grid

### Page type "Social Feed"
```
max-w-7xl mx-auto
grid-cols-1 lg:grid-cols-[220px_1fr_300px]
gap-6
```

### Colonnes
- **Left sidebar** : 220px, sticky top-20, navigation + espaces
- **Main** : 1fr, feed ou contenu principal
- **Right sidebar** : 300px, widgets sticky

### Padding global
- Sections : `px-4`
- Cards internes : `p-3` ou `p-4`
- **Jamais** de padding > p-4 sur un élément UI

---

## 5. Composants & Classes Utilitaires

### Fond
- `.grid-dots` — pattern de points subtil (obligatoire sur le wrapper racine)
- `.aurora` — gradient animé en banner

### Surfaces
- `.glass-header` — header sticky avec backdrop-blur
- `.glow-hover` — shadow glow au hover
- `.spotlight` — halo lumineux qui suit le curseur (sur les cards principales)
- `.shimmer-border` — bordure qui brille au hover
- `.gradient-border-spin` — bordure avec gradient qui tourne au hover (effet premium)
- `.inner-glow` — lueur interne subtile sur les cards
- `.card-lift` — card qui flotte au hover (translateY -4px + ombre)

### Typographie
- `.font-display` — Space Grotesk pour les titres principaux
- `.text-glow` — halo cyan autour du texte
- `.text-glow-blue` — halo bleu autour du texte
- `.line-accent` — soulignement animé au hover (gradient cyan→bleu)
- `.gradient-text` — gradient cyan → bleu (pour les titres importants)
- `.data-num` — chiffres en JetBrains Mono, tabular-nums

### Avatars
- `.avatar-ring` — anneau gradient autour des avatars

### Textures
- `.noise` — texture de bruit subtile overlay sur toute la page

### Animations
- `.animate-slide-up` — entrée par le bas
- `.animate-fade-in` — fade simple
- `.animate-pulse-glow` — halo pulsant
- `.reveal` + `.reveal.visible` — apparition au scroll

---

## 6. Patterns de Composants

### Post / Feed Item
```
py-2.5 px-3
hover:bg-card-hover/30
Vote column à gauche (ChevronUp/Down)
Header : author · @handle · time · badge · source
Title : text-[13px] font-medium
Body : text-[13px] text-muted-foreground line-clamp-2
Tags : text-[11px] text-accent/80
Actions : micro-réactions emoji + comment + share + bookmark
```

### Card Widget (Sidebar)
```
<Card> avec p-3
Header : text-sm flex items-center gap-2 + icon accent
Content : text-xs, espacement 2-2.5
Live items : emoji + text + count + time
```

### Bouton Primaire
```
rounded-full
shadow-[0_0_24px_rgba(0,212,170,0.25)] (optionnel, pour CTA)
hover:shadow-[0_0_32px_rgba(0,212,170,0.35)]
```

### Logo
```
bg-gradient-to-br from-accent to-accent-2
shadow-[0_0_16px_rgba(0,212,170,0.25)]
```

---

## 7. Principes de Density

- **Taille de police base** : 13-14px
- **Line-height** : snug (1.25) ou relaxed (1.5) selon contexte
- **Espace vertical** : 2-3px entre lignes liées, 6px entre blocs
- **Cards** : jamais de shadow lourd, juste border + hover glow
- **Boutons** : h-8 ou h-9, pas plus grand
- **Icons** : 12-16px, jamais 20px+ sauf navigation

---

## 8. Principes d'Engagement Visuel

1. **Vote binaire visible** : +1/-1 toujours visibles, pas cachés dans un menu
2. **Micro-réactions** : 4 emojis max par post, compteurs en font-mono
3. **Source transparente** : lien "source" visible sur chaque contenu curaté
4. **Live indicators** : ping animé + compteur "X en ligne"
5. **Deltas** : "+12%", "+3" à côté des chiffres clés

---

## 9. Anti-Patterns (INTERDITS)

- ❌ Couleurs hardcodées (`#fff`, `red`, etc.)
- ❌ Tailles de police > 32px
- ❌ Padding > p-4
- ❌ Shadow box-heavy (style Material Design)
- ❌ Dégradés partout (uniquement sur accents)
- ❌ Boutons carrés (toujours rounded-full ou rounded-lg)
- ❌ Texte centré dans le feed (toujours left-align)
- ❌ Carousel / slider dans le feed
- ❌ Modales pour des actions simples

---

## 10. Fichiers de Référence

| Fichier | Rôle |
|---|---|
| `app/globals.css` | Variables CSS + utilitaires + animations |
| `tailwind.config.ts` | Mapping Tailwind → variables |
| `app/layout.tsx` | Import SpotlightProvider + themeColor |
| `app/page.tsx` | Référence complète de page type "Feed" |
| `app/components/data-feed.tsx` | Référence de composant feed |

---

## 11. Checklist Nouvelle Page

Avant de merger une nouvelle page :
- [ ] Utilise `--background`, `--card`, `--foreground` (pas de hardcoded)
- [ ] Padding ≤ p-4 partout
- [ ] Titres : `.font-display` + `.text-glow` pour les h1/h2
- [ ] Boutons rounded-full ou rounded-lg
- [ ] Fonts : Inter (body) + JetBrains Mono (data) + Space Grotesk (titres)
- [ ] `.grid-dots` + `.noise` sur le wrapper racine
- [ ] Header utilise `.glass-header`
- [ ] Cards importantes ont `.spotlight` + `.inner-glow`
- [ ] Cards interactives ont `.card-lift` + `.gradient-border-spin`
- [ ] Pas de carousel, pas de modal inutile
- [ ] Build passe sans erreur
