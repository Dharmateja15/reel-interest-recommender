import { InteractionReel } from '../lib/types';

export const demoTrapHistory: InteractionReel[] = [
  {
    id: 'trap-1',
    title: 'Java Garbage Collection Meme',
    category: 'Meme',
    description: 'A hilarious parody about JVM Garbage Collector consuming memory during production deploys.'
  },
  {
    id: 'trap-2',
    title: 'Software Engineer Lifestyle in NYC',
    category: 'Lifestyle',
    description: 'Day in the life vlog of a software developer drinking matcha, coding, and going to meetings.'
  },
  {
    id: 'trap-3',
    title: 'System Design Coding Interview Stress',
    category: 'Meme',
    description: 'Funny meme about trying to explain system design scaling parameters under heavy stress.'
  },
  {
    id: 'trap-4',
    title: 'MacBook Pro M4 vs ThinkPad for Devs',
    category: 'Comparison',
    description: 'Direct comparison of CPU compile times, container execution speeds, and keyboard feels.'
  }
];

export const demoTrapHistoryAltCurrent: InteractionReel[] = [
  ...demoTrapHistory
];

export const aiClusterHistory: InteractionReel[] = [
  {
    id: 'ai-1',
    title: 'Building an LLM from scratch in Python',
    category: 'Tutorial',
    description: 'Step by step walkthrough coding self-attention blocks in a Transformer neural network.'
  },
  {
    id: 'ai-2',
    title: '10 ChatGPT API tips for devs',
    category: 'Tutorial',
    description: 'Best practices for prompt engineering, token optimization, and managing conversation state.'
  },
  {
    id: 'ai-3',
    title: 'Prompt engineering vs fine-tuning',
    category: 'Discussion',
    description: 'Comparing when to use complex context prompts vs retraining model weights on custom datasets.'
  }
];

export const hardwareClusterHistory: InteractionReel[] = [
  {
    id: 'hw-1',
    title: 'Assembly Programming in 10 Minutes',
    category: 'Tutorial',
    description: 'Writing register instructions, jumps, and interrupt handling for x86 architectures.'
  },
  {
    id: 'hw-2',
    title: 'CPU Cache memory hierarchy explained',
    category: 'Tutorial',
    description: 'Deep dive into why L1, L2, L3 cache structure affects algorithmic latency.'
  },
  {
    id: 'hw-3',
    title: 'Building a 16-bit computer on breadboards',
    category: 'Tutorial',
    description: 'Connecting physical logic gates to build memory registers, ALUs, and instruction decoders.'
  }
];

export const ambiguousHistory: InteractionReel[] = [
  {
    id: 'amb-1',
    title: 'Reviewing a 15-ingredient Ramen recipe',
    category: 'Tutorial',
    description: 'Cooking vlog detailing how to make authentic Japanese tonkotsu noodle broth from scratch.'
  },
  {
    id: 'amb-2',
    title: 'Cute kittens playing with yarn',
    category: 'Other',
    description: 'Watch these adorable newborn kittens cuddle, roll around, and play with toys.'
  },
  {
    id: 'amb-3',
    title: 'Leetcode binary search animation',
    category: 'Tutorial',
    description: 'Visual animation showing left and right pointers updating in binary search iterations.'
  }
];

export const noTechSignalHistory: InteractionReel[] = [
  {
    id: 'notech-1',
    title: 'Best dynamic stretching routine',
    category: 'Tutorial',
    description: 'Daily stretch tutorial to improve lower back mobility and hamstring flexibility.'
  },
  {
    id: 'notech-2',
    title: 'How to make sourdough bread at home',
    category: 'Tutorial',
    description: 'Step-by-step baking vlog detailing flour fermentation, kneading, and Dutch oven baking.'
  },
  {
    id: 'notech-3',
    title: 'Funny dog refuses to take bath',
    category: 'Meme',
    description: 'Hilarious video of a golden retriever hiding under the bed when hearing the faucet.'
  }
];

export const singleStrongSignalHistory: InteractionReel[] = [
  {
    id: 'strong-1',
    title: 'Understanding Docker multi-stage builds',
    category: 'Tutorial',
    description: 'How to optimize deployment image size by copying artifacts from intermediate build containers.'
  },
  {
    id: 'strong-2',
    title: 'Kubernetes configmaps and secrets guide',
    category: 'Tutorial',
    description: 'Injecting dynamic configurations and encrypted database credentials into pod environments.'
  }
];

export const weakSingleSignalHistory: InteractionReel[] = [
  {
    id: 'weak-1',
    title: 'Minimal Desk Setup Tour 2026',
    category: 'Lifestyle',
    description: 'Showing desk lighting, monitor arm positions, and aesthetic cable organization ideas.'
  },
  {
    id: 'weak-2',
    title: 'Funny gaming compilation clip',
    category: 'Meme',
    description: 'Hilarious glitches and funny fail clips in multiplayer shooting match.'
  }
];

export interface HistoryScenario {
  id: string;
  title: string;
  description: string;
  history: InteractionReel[];
  defaultCurrentReelId: string;
}

export const historyScenarios: Record<string, HistoryScenario> = {
  demoTrapHistory: {
    id: 'demoTrapHistory',
    title: 'SWE Trap Scenario (MacBook current)',
    description: 'High-signal Java/SWE lifestyle memes. Current Reel is Laptop Comparison. Trap tests broad SWE interest extraction.',
    history: demoTrapHistory,
    defaultCurrentReelId: 'trap-4'
  },
  demoTrapHistoryAltCurrent: {
    id: 'demoTrapHistoryAltCurrent',
    title: 'SWE Trap Scenario (Java GC current)',
    description: 'Same history, but Current Reel is Java GC Meme. Tests if JVM interest dominates or remains broad.',
    history: demoTrapHistoryAltCurrent,
    defaultCurrentReelId: 'trap-1'
  },
  aiClusterHistory: {
    id: 'aiClusterHistory',
    title: 'AI Cluster Scenario',
    description: ' tutorials and prompt discussions. Tests AI interest extraction.',
    history: aiClusterHistory,
    defaultCurrentReelId: 'ai-3'
  },
  hardwareClusterHistory: {
    id: 'hardwareClusterHistory',
    title: 'Hardware Cluster Scenario',
    description: 'Assembly programming, logic gates, cache architecture. Tests Hardware interest extraction.',
    history: hardwareClusterHistory,
    defaultCurrentReelId: 'hw-3'
  },
  ambiguousHistory: {
    id: 'ambiguousHistory',
    title: 'Ambiguous Scenario',
    description: 'Cooking and kittens mixed with a single DSA video. Tests low confidence handling.',
    history: ambiguousHistory,
    defaultCurrentReelId: 'amb-3'
  },
  noTechSignalHistory: {
    id: 'noTechSignalHistory',
    title: 'No Tech Signal Scenario',
    description: 'Baking, stretching, dog memes. Tests Insufficient technology signal handling.',
    history: noTechSignalHistory,
    defaultCurrentReelId: 'notech-3'
  },
  singleStrongSignalHistory: {
    id: 'singleStrongSignalHistory',
    title: 'Single Strong Signal Scenario',
    description: 'Docker and Kubernetes tutorials. Tests high-signal Cloud interest extraction.',
    history: singleStrongSignalHistory,
    defaultCurrentReelId: 'strong-2'
  },
  weakSingleSignalHistory: {
    id: 'weakSingleSignalHistory',
    title: 'Weak Single Signal Scenario',
    description: 'Desk setups and gaming memes. Tests low-signal / weak interest handling.',
    history: weakSingleSignalHistory,
    defaultCurrentReelId: 'weak-2'
  }
};
