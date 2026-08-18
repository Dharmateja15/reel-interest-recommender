export interface YouTubeRecommendation {
  title: string;
  url: string;
}

export const youtubeRecommendations: Record<string, YouTubeRecommendation[]> = {
  'ai-transformers': [
    {
      title: 'Attention in transformers, step-by-step (3Blue1Brown)',
      url: 'https://www.youtube.com/watch?v=wjZofJX0v4M'
    },
    {
      title: 'Transformers, the tech behind LLMs (3Blue1Brown)',
      url: 'https://www.youtube.com/watch?v=eMxw53s8ZqQ'
    },
    {
      title: 'Let\'s build GPT: from scratch, in code (Andrej Karpathy)',
      url: 'https://www.youtube.com/watch?v=kCc8FmEb1nY'
    }
  ],
  'ai-tools-hype': [
    {
      title: 'AI Hype vs Reality (Fireship)',
      url: 'https://www.youtube.com/watch?v=2-M-8T4xVDE'
    }
  ],
  'dsa-red-black': [
    {
      title: 'Red Black Tree Insertion & Rotations (Abdul Bari)',
      url: 'https://www.youtube.com/watch?v=qvZGUFHWChY'
    },
    {
      title: 'Red Black Trees in 3 Minutes',
      url: 'https://www.youtube.com/watch?v=5IBxA-bZZ28'
    }
  ],
  'dsa-hashmap': [
    {
      title: 'Data Structures: Hash Tables (HackerRank)',
      url: 'https://www.youtube.com/watch?v=shs0KM3w0zs'
    },
    {
      title: 'How HashMaps Work Under the Hood in Java',
      url: 'https://www.youtube.com/watch?v=c3RVW3KGIIE'
    }
  ],
  'java-garbage-collector': [
    {
      title: 'Java Garbage Collection Fundamentals (Java Brains)',
      url: 'https://www.youtube.com/watch?v=2MJL_b8mNl0'
    },
    {
      title: 'JVM Memory Model & Garbage Collectors Explained',
      url: 'https://www.youtube.com/watch?v=UnaNQgzw4zY'
    }
  ],
  'java-threads': [
    {
      title: 'Virtual Threads in Java 21 Explained (Venkat Subramaniam)',
      url: 'https://www.youtube.com/watch?v=5E3H5Z3_13E'
    },
    {
      title: 'Java Virtual Threads Deep Dive',
      url: 'https://www.youtube.com/watch?v=r_bFkX4K-k0'
    }
  ],
  'hld-rate-limiter': [
    {
      title: 'Design a Rate Limiter | System Design (ByteByteGo)',
      url: 'https://www.youtube.com/watch?v=FU4WlwfS3G0'
    },
    {
      title: 'Rate Limiting Algorithms Explained',
      url: 'https://www.youtube.com/watch?v=CRGPbCbRfZU'
    }
  ],
  'hld-load-balancing': [
    {
      title: 'Load Balancers Explained | System Design (ByteByteGo)',
      url: 'https://www.youtube.com/watch?v=K0Ta65OqQkY'
    },
    {
      title: 'Consistent Hashing System Design Concept',
      url: 'https://www.youtube.com/watch?v=s1qW29633eA'
    }
  ],
  'cyber-buffer-overflow': [
    {
      title: 'Buffer Overflow Attack Explained (LiveOverflow)',
      url: 'https://www.youtube.com/watch?v=1S0aBV-Waeo'
    },
    {
      title: 'Buffer Overflows (Computerphile)',
      url: 'https://www.youtube.com/watch?v=HSlhY4Uy8DA'
    }
  ],
  'cyber-phishing': [
    {
      title: 'How MFA Bypass Phishing Works (NetworkChuck)',
      url: 'https://www.youtube.com/watch?v=Y7zNlEMDmI4'
    }
  ],
  'cloud-docker-layers': [
    {
      title: 'Docker Tutorial for Beginners (TechWorld with Nana)',
      url: 'https://www.youtube.com/watch?v=gAkwW2u-Eag'
    },
    {
      title: 'Docker Image Layers & Caching Explained (Fireship)',
      url: 'https://www.youtube.com/watch?v=3c-iBn73dDE'
    }
  ],
  'cloud-k8s-pod-lifecycle': [
    {
      title: 'Kubernetes Architecture Explained (TechWorld with Nana)',
      url: 'https://www.youtube.com/watch?v=X48VuDVv0do'
    },
    {
      title: 'Kubernetes in 100 Seconds (Fireship)',
      url: 'https://www.youtube.com/watch?v=d6WC5n9G_sM'
    }
  ],
  'hardware-cpu-cache': [
    {
      title: 'CPU Caches Explained: L1, L2, L3 Memory Hierarchy',
      url: 'https://www.youtube.com/watch?v=yi0FhRqDJfo'
    },
    {
      title: 'Cache Coherence Protocols & MESI Explained',
      url: 'https://www.youtube.com/watch?v=W3f34F90r6I'
    }
  ],
  'hardware-logic-gates': [
    {
      title: 'Building a 4-Bit Computer From Logic Gates (Ben Eater)',
      url: 'https://www.youtube.com/watch?v=gI-qXk7XojA'
    },
    {
      title: 'How Logic Gates Work (Ben Eater)',
      url: 'https://www.youtube.com/watch?v=sTu3LwpF6XI'
    }
  ],
  'career-resume-tips': [
    {
      title: 'Software Engineer Resume Template & Tips',
      url: 'https://www.youtube.com/watch?v=BYUy1yvZjSi'
    }
  ],
  'career-interview-prep': [
    {
      title: 'How to Pass Coding & Technical Interviews',
      url: 'https://www.youtube.com/watch?v=r1MXwyiGi_U'
    }
  ],
  'other-git-internals': [
    {
      title: 'Git Internals - How Git Works (Computerphile)',
      url: 'https://www.youtube.com/watch?v=fctKc-WjwBU'
    }
  ],
  'other-vim-tutorial': [
    {
      title: 'Vim in 100 Seconds (Fireship)',
      url: 'https://www.youtube.com/watch?v=ER5JYFK8Wb0'
    }
  ]
};

export function getRandomVerifiedVideo(candidateId: string): YouTubeRecommendation | null {
  const pool = youtubeRecommendations[candidateId];
  if (!pool || pool.length === 0) return null;
  const randomIndex = Math.floor(Math.random() * pool.length);
  return pool[randomIndex];
}
