export interface YouTubeRecommendation {
  title: string;
  url: string;
}

const buildSearchUrl = (title: string): string =>
  `https://www.youtube.com/results?search_query=${encodeURIComponent(title)}`;

export const youtubeRecommendations: Record<string, YouTubeRecommendation[]> = {
  'ai-transformers': [
    {
      title: 'Attention in transformers step-by-step 3Blue1Brown',
      url: buildSearchUrl('Attention in transformers step-by-step 3Blue1Brown')
    },
    {
      title: 'Transformers the tech behind LLMs 3Blue1Brown',
      url: buildSearchUrl('Transformers the tech behind LLMs 3Blue1Brown')
    },
    {
      title: "Let's build GPT from scratch in code Andrej Karpathy",
      url: buildSearchUrl("Let's build GPT from scratch in code Andrej Karpathy")
    }
  ],
  'ai-tools-hype': [
    {
      title: 'AI Hype vs Reality Fireship',
      url: buildSearchUrl('AI Hype vs Reality Fireship')
    }
  ],
  'dsa-red-black': [
    {
      title: 'Red Black Tree Insertion Rotations Abdul Bari',
      url: buildSearchUrl('Red Black Tree Insertion Rotations Abdul Bari')
    },
    {
      title: 'Red Black Trees in 3 Minutes',
      url: buildSearchUrl('Red Black Trees in 3 Minutes')
    }
  ],
  'dsa-hashmap': [
    {
      title: 'Data Structures Hash Tables HackerRank',
      url: buildSearchUrl('Data Structures Hash Tables HackerRank')
    },
    {
      title: 'How HashMaps Work Under the Hood in Java',
      url: buildSearchUrl('How HashMaps Work Under the Hood in Java')
    }
  ],
  'java-garbage-collector': [
    {
      title: 'Java Garbage Collection Fundamentals Java Brains',
      url: buildSearchUrl('Java Garbage Collection Fundamentals Java Brains')
    },
    {
      title: 'JVM Memory Model Garbage Collectors Explained',
      url: buildSearchUrl('JVM Memory Model Garbage Collectors Explained')
    }
  ],
  'java-threads': [
    {
      title: 'Virtual Threads in Java 21 Explained Venkat Subramaniam',
      url: buildSearchUrl('Virtual Threads in Java 21 Explained Venkat Subramaniam')
    },
    {
      title: 'Java Virtual Threads Deep Dive',
      url: buildSearchUrl('Java Virtual Threads Deep Dive')
    }
  ],
  'hld-rate-limiter': [
    {
      title: 'Design a Rate Limiter System Design ByteByteGo',
      url: buildSearchUrl('Design a Rate Limiter System Design ByteByteGo')
    },
    {
      title: 'Rate Limiting Algorithms Explained',
      url: buildSearchUrl('Rate Limiting Algorithms Explained')
    }
  ],
  'hld-load-balancing': [
    {
      title: 'Load Balancers Explained System Design ByteByteGo',
      url: buildSearchUrl('Load Balancers Explained System Design ByteByteGo')
    },
    {
      title: 'Consistent Hashing System Design Concept',
      url: buildSearchUrl('Consistent Hashing System Design Concept')
    }
  ],
  'cyber-buffer-overflow': [
    {
      title: 'Buffer Overflow Attack Explained LiveOverflow',
      url: buildSearchUrl('Buffer Overflow Attack Explained LiveOverflow')
    },
    {
      title: 'Buffer Overflows Computerphile',
      url: buildSearchUrl('Buffer Overflows Computerphile')
    }
  ],
  'cyber-phishing': [
    {
      title: 'How MFA Bypass Phishing Works NetworkChuck',
      url: buildSearchUrl('How MFA Bypass Phishing Works NetworkChuck')
    }
  ],
  'cloud-docker-layers': [
    {
      title: 'Docker Tutorial for Beginners TechWorld with Nana',
      url: buildSearchUrl('Docker Tutorial for Beginners TechWorld with Nana')
    },
    {
      title: 'Docker Image Layers Caching Explained Fireship',
      url: buildSearchUrl('Docker Image Layers Caching Explained Fireship')
    }
  ],
  'cloud-k8s-pod-lifecycle': [
    {
      title: 'Kubernetes Architecture Explained TechWorld with Nana',
      url: buildSearchUrl('Kubernetes Architecture Explained TechWorld with Nana')
    },
    {
      title: 'Kubernetes in 100 Seconds Fireship',
      url: buildSearchUrl('Kubernetes in 100 Seconds Fireship')
    }
  ],
  'hardware-cpu-cache': [
    {
      title: 'CPU Caches Explained L1 L2 L3 Memory Hierarchy',
      url: buildSearchUrl('CPU Caches Explained L1 L2 L3 Memory Hierarchy')
    },
    {
      title: 'Cache Coherence Protocols MESI Explained',
      url: buildSearchUrl('Cache Coherence Protocols MESI Explained')
    }
  ],
  'hardware-logic-gates': [
    {
      title: 'Building a 4-Bit Computer From Logic Gates Ben Eater',
      url: buildSearchUrl('Building a 4-Bit Computer From Logic Gates Ben Eater')
    },
    {
      title: 'How Logic Gates Work Ben Eater',
      url: buildSearchUrl('How Logic Gates Work Ben Eater')
    }
  ],
  'career-resume-tips': [
    {
      title: 'Software Engineer Resume Template Tips',
      url: buildSearchUrl('Software Engineer Resume Template Tips')
    }
  ],
  'career-interview-prep': [
    {
      title: 'How to Pass Coding Technical Interviews',
      url: buildSearchUrl('How to Pass Coding Technical Interviews')
    }
  ],
  'other-git-internals': [
    {
      title: 'Git Internals How Git Works Computerphile',
      url: buildSearchUrl('Git Internals How Git Works Computerphile')
    }
  ],
  'other-vim-tutorial': [
    {
      title: 'Vim in 100 Seconds Fireship',
      url: buildSearchUrl('Vim in 100 Seconds Fireship')
    }
  ]
};

export function getRandomVerifiedVideo(candidateId: string): YouTubeRecommendation | null {
  const pool = youtubeRecommendations[candidateId];
  if (!pool || pool.length === 0) return null;
  const randomIndex = Math.floor(Math.random() * pool.length);
  return pool[randomIndex];
}
