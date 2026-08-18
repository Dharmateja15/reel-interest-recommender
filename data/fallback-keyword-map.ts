import { Category } from '../lib/types';

export const fallbackKeywordMap: { keyword: string; category: Category }[] = [
  { keyword: 'java', category: 'Java' },
  { keyword: 'spring', category: 'Java' },
  { keyword: 'jvm', category: 'Java' },
  { keyword: 'hibernate', category: 'Java' },
  
  { keyword: 'ai', category: 'AI' },
  { keyword: 'gpt', category: 'AI' },
  { keyword: 'llm', category: 'AI' },
  { keyword: 'transformer', category: 'AI' },
  { keyword: 'machine learning', category: 'AI' },
  { keyword: 'neural', category: 'AI' },
  
  { keyword: 'hardware', category: 'Hardware' },
  { keyword: 'cpu', category: 'Hardware' },
  { keyword: 'gpu', category: 'Hardware' },
  { keyword: 'assembly', category: 'Hardware' },
  { keyword: 'x86', category: 'Hardware' },
  { keyword: 'transistor', category: 'Hardware' },
  
  { keyword: 'docker', category: 'Cloud' },
  { keyword: 'kubernetes', category: 'Cloud' },
  { keyword: 'aws', category: 'Cloud' },
  { keyword: 'cloud', category: 'Cloud' },
  
  { keyword: 'security', category: 'Cybersecurity' },
  { keyword: 'cyber', category: 'Cybersecurity' },
  { keyword: 'hack', category: 'Cybersecurity' },
  { keyword: 'malware', category: 'Cybersecurity' },
  
  { keyword: 'leetcode', category: 'DSA' },
  { keyword: 'algorithm', category: 'DSA' },
  { keyword: 'binary tree', category: 'DSA' },
  { keyword: 'sorting', category: 'DSA' },
  { keyword: 'dsa', category: 'DSA' },
  
  { keyword: 'system design', category: 'HLD' },
  { keyword: 'hld', category: 'HLD' },
  { keyword: 'microservice', category: 'HLD' },
  { keyword: 'load balancer', category: 'HLD' },
  
  { keyword: 'career', category: 'Career' },
  { keyword: 'interview', category: 'Career' },
  { keyword: 'resume', category: 'Career' },
  { keyword: 'job', category: 'Career' }
];
