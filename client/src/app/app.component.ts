import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ChessBoardComponent } from "./chess-board/chess-board.component";
import { ChessDebuggerComponent } from './chess-debugger/chess-debugger.component';

@Component({
  selector: 'app-root',
  imports: [ChessBoardComponent, ChessDebuggerComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'chess-project';
}
