import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios, { AxiosInstance } from 'axios';

export enum AIModel {
  GEMINI_FLASH = 'google/gemini-flash-1.5',
  DEEPSEEK_R1 = 'deepseek/deepseek-r1',
}

@Injectable()
export class OpenRouterService {
  private readonly client: AxiosInstance;
  private readonly apiKey: string;

  constructor(private configService: ConfigService) {
    this.apiKey = this.configService.getOrThrow<string>('OPENROUTER_API_KEY');
    this.client = axios.create({
      baseURL: 'https://openrouter.ai/api/v1',
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
    });
  }

  async summarize(text: string): Promise<string> {
    return this.callModel(
      AIModel.GEMINI_FLASH,
      `Summarize the following text: ${text}`,
    );
  }

  async logic(prompt: string): Promise<string> {
    return this.callModel(AIModel.DEEPSEEK_R1, prompt);
  }

  private async callModel(model: AIModel, prompt: string): Promise<string> {
    try {
      const response = await this.client.post('/chat/completions', {
        model,
        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],
      });
      const content = response.data.choices[0]?.message?.content;

      if (!content) {
        throw new Error('No content received from AI model');
      }

      return content;
    } catch (error) {
      console.error('OpenRouter API error:', error);
      throw new Error('Failed to get AI response');
    }
  }
}
