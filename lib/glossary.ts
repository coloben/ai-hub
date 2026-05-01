export interface GlossaryEntry {
  term: string
  short: string
  definition: string
  example?: string
  category: 'model' | 'benchmark' | 'concept' | 'technique' | 'metric'
}

export const glossary: GlossaryEntry[] = [
  // Modèles
  {
    term: 'LLM',
    short: 'Grand modèle de langage',
    definition: 'Un modèle d\'IA entraîné sur des milliards de textes pour comprendre et générer du langage naturel. Ex : GPT-5, Claude, Llama.',
    example: 'Quand vous demandez à ChatGPT de rédiger un email, c\'est un LLM qui génère la réponse.',
    category: 'model',
  },
  {
    term: 'Agent IA',
    short: 'IA autonome qui agit',
    definition: 'Un système d\'IA capable de planifier, utiliser des outils (API, navigateur, code) et prendre des décisions autonomes pour atteindre un objectif. Contrairement à un chatbot qui répond, un agent agit.',
    example: 'Un agent peut chercher sur le web, remplir un formulaire et envoyer un email tout seul.',
    category: 'concept',
  },
  {
    term: 'Modèle de code',
    short: 'IA spécialisée en programmation',
    definition: 'Un LLM optimisé pour générer, corriger et expliquer du code informatique. Évalué sur des benchmarks comme HumanEval et MBPP.',
    example: 'GitHub Copilot utilise un modèle de code pour suggérer des lignes de code en temps réel.',
    category: 'model',
  },
  {
    term: 'Modèle multimodal',
    short: 'IA qui comprend images + texte',
    definition: 'Un modèle capable de traiter simultanément du texte, des images, de l\'audio ou de la vidéo. Va au-delà du texte seul.',
    example: 'GPT-5 Vision peut analyser une photo et décrire ce qu\'il voit en détail.',
    category: 'model',
  },
  {
    term: 'Modèle open-source',
    short: 'Modèle libre et téléchargeable',
    definition: 'Un modèle dont les poids (weights) sont publiquement disponibles. Vous pouvez le télécharger, le modifier et le faire tourner sur votre propre serveur.',
    example: 'Llama 4 et Mistral Large sont open-source — vous pouvez les héberger localement.',
    category: 'model',
  },
  {
    term: 'Modèle propriétaire',
    short: 'Modèle accessible via API uniquement',
    definition: 'Un modèle fermé dont le code et les poids ne sont pas publics. Vous y accédez uniquement via l\'API du fournisseur (payant).',
    example: 'GPT-5 et Claude Opus 5 sont propriétaires — vous devez payer OpenAI/Anthropic pour les utiliser.',
    category: 'model',
  },
  {
    term: 'RAG',
    short: 'Génération augmentée par retrieval',
    definition: 'Technique qui permet à un LLM de consulter une base de documents externe avant de répondre. Améliore la précision et réduit les hallucinations.',
    example: 'Un chatbot d\'entreprise utilise le RAG pour répondre en se basant sur ses documents internes.',
    category: 'technique',
  },
  {
    term: 'Fine-tuning',
    short: 'Spécialiser un modèle',
    definition: 'Entraîner un modèle existant sur des données spécifiques à votre domaine pour améliorer ses performances sur une tâche précise.',
    example: 'Fine-tuner Llama sur des dossiers médicaux pour créer un assistant santé.',
    category: 'technique',
  },
  // Benchmarks
  {
    term: 'MMLU',
    short: 'Test de connaissances générales',
    definition: 'Massive Multitask Language Understanding — un benchmark qui teste les connaissances d\'un modèle sur 57 sujets (droit, médecine, histoire, maths...). Score en %.',
    example: 'Un score MMLU de 92% signifie que le modèle répond correctement à 92% des questions.',
    category: 'benchmark',
  },
  {
    term: 'HumanEval',
    short: 'Test de programmation',
    definition: 'Un benchmark de 164 exercices de programmation Python. Mesure la capacité d\'un modèle à écrire du code fonctionnel. Score en % (pass@1).',
    example: 'HumanEval 95% = le modèle écrit du code qui fonctionne dans 95% des cas.',
    category: 'benchmark',
  },
  {
    term: 'Arena ELO',
    short: 'Classement par votes humains',
    definition: 'Score calculé via le LMSYS Chatbot Arena où des humains comparent anonymement deux modèles. Le système ELO (comme aux échecs) classe les modèles.',
    example: 'Un ELO de 1342 est excellent — le modèle gagne contre la majorité des autres.',
    category: 'benchmark',
  },
  {
    term: 'GPQA',
    short: 'Questions de niveau expert',
    definition: 'Graduate-Level Google-Proof Q&A — des questions si difficiles que même des experts avec accès à Google répondent mal. Teste le raisonnement profond.',
    example: 'Un bon score GPQA indique un modèle capable de raisonnement de niveau PhD.',
    category: 'benchmark',
  },
  {
    term: 'MATH',
    short: 'Test de mathématiques',
    definition: 'Benchmark de problèmes mathématiques de compétition (niveau lycée à olympiades). Évalue le raisonnement mathématique formel.',
    example: 'MATH 80% = le modèle résout 80% des problèmes de compétition.',
    category: 'benchmark',
  },
  {
    term: 'MBPP',
    short: 'Programmation basique Python',
    definition: 'Mostly Basic Python Problems — 974 problèmes de programmation Python de niveau débutant à intermédiaire. Complément d\'HumanEval.',
    category: 'benchmark',
  },
  // Métriques
  {
    term: 'Tokens par seconde (TPS)',
    short: 'Vitesse de génération',
    definition: 'Nombre de tokens générés par seconde. Plus c\'est élevé, plus le modèle répond vite. Crucial pour les applications temps réel.',
    example: '100 TPS = le modèle produit ~75 mots par seconde.',
    category: 'metric',
  },
  {
    term: 'Fenêtre de contexte',
    short: 'Mémoire du modèle',
    definition: 'Quantité maximale de texte que le modèle peut traiter en une seule fois. 1 token ≈ 0.75 mot. Plus la fenêtre est grande, plus le modèle "se souvient" de la conversation.',
    example: 'Contexte 128k = le modèle peut traiter un document de ~96 000 mots d\'un coup.',
    category: 'metric',
  },
  {
    term: 'Prix d\'API',
    short: 'Coût d\'utilisation',
    definition: 'Coût pour utiliser le modèle via API, exprimé en $ par million de tokens. Prix entrée (input) = ce que vous envoyez, Prix sortie (output) = ce que le modèle génère.',
    example: 'GPT-5 à $5/$15 par 1M tokens = envoyer 1M tokens coûte $5, recevoir 1M tokens coûte $15.',
    category: 'metric',
  },
  {
    term: 'Hallucination',
    short: 'Réponse fausse mais convaincante',
    definition: 'Quand un modèle d\'IA génère une information fausse avec beaucoup de confiance. C\'est le problème n°1 des LLMs.',
    example: 'Le modèle affirme qu\'un événement historique a eu lieu alors qu\'il est totalement inventé.',
    category: 'concept',
  },
  {
    term: 'Temperature',
    short: 'Niveau de créativité',
    definition: 'Paramètre (0 à 2) qui contrôle la créativité des réponses. 0 = déterministe/répétitif, 1 = équilibré, 2 = très créatif/aléatoire.',
    example: 'Temperature 0 pour du code, temperature 0.7 pour de la rédaction créative.',
    category: 'concept',
  },
  {
    term: 'Embedding',
    short: 'Représentation vectorielle',
    definition: 'Transformation d\'un texte en un vecteur numérique. Utilisé pour la recherche sémantique, le RAG et la similarité entre textes.',
    example: 'Les embeddings permettent de trouver des documents "similaires" même sans mots en commun.',
    category: 'technique',
  },
  {
    term: 'MoE',
    short: 'Mixture of Experts',
    definition: 'Architecture où seuls une partie des paramètres sont activés pour chaque requête. Plus rapide et moins cher, avec des performances proches d\'un modèle complet.',
    example: 'GPT-5 utilise du MoE : 2T paramètres totaux mais ~300B activés par requête.',
    category: 'technique',
  },
  {
    term: 'RLHF',
    short: 'Apprentissage par retours humains',
    definition: 'Technique d\'entraînement où des humains notent les réponses du modèle pour l\'aligner sur les préférences humaines. Rend les modèles plus utiles et sûrs.',
    example: 'Merci à RLHF que ChatGPT refuse les requêtes dangereuses.',
    category: 'technique',
  },
  {
    term: 'Inférence',
    short: 'Utilisation du modèle',
    definition: 'Le processus de faire tourner un modèle pour obtenir une réponse. Distinct de l\'entraînement (training). L\'inférence est ce que vous payez quand vous utilisez une API.',
    category: 'concept',
  },
  {
    term: 'Paramètres',
    short: 'Taille du modèle',
    definition: 'Nombre de "poids" (connections) dans le réseau neuronal. Plus il y a de paramètres, plus le modèle est puissant (mais aussi lent et coûteux). 1B = 1 milliard.',
    example: 'Llama 4 Maverick a 400B paramètres, Llama 4 Scout en a 109B.',
    category: 'metric',
  },
]

export function getGlossaryTerm(term: string): GlossaryEntry | undefined {
  return glossary.find(g => g.term.toLowerCase() === term.toLowerCase())
}

export function searchGlossary(query: string): GlossaryEntry[] {
  const q = query.toLowerCase()
  return glossary.filter(g => 
    g.term.toLowerCase().includes(q) || 
    g.short.toLowerCase().includes(q) ||
    g.definition.toLowerCase().includes(q)
  )
}
