import { Routes } from '@angular/router';
import { GeminiComponent } from './gemini.component';
import { O3Component } from './o3.component';
import { ClaudeComponent } from './claude.component';
import { MistralComponent } from './mistral-component/mistral-component.component';

export const routes: Routes = [
  { path: 'gemini', component: GeminiComponent },
  { path: 'claude', component: ClaudeComponent },
  { path: 'o3', component: O3Component },
  { path: 'mistral', component: MistralComponent },
];
