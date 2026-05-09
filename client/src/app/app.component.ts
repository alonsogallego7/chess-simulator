import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ChessBoardComponent } from "./chess-board/chess-board.component";
import { ChessEnginePanelComponent } from './chess-engine-panel/chess-engine-panel.component';

@Component({
  selector: 'app-root',
  imports: [ChessBoardComponent, ChessEnginePanelComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'chess-project';
}
