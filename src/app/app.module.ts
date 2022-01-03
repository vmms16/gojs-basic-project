import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouterModule, Routes } from '@angular/router';
import { GojsAngularModule } from 'gojs-angular';

import { AppComponent } from './app.component';
import { TesteComponent } from './teste/teste.component';
import { JointjsTesteComponent } from './jointjs-teste/jointjs-teste.component';

const appRoutes: Routes = [
  { path: '', component: AppComponent },
  { path: 'teste', component: TesteComponent },
];
@NgModule({
  declarations: [
    AppComponent,
    TesteComponent,
    JointjsTesteComponent,
  ],
  imports: [
    BrowserModule,
    RouterModule.forRoot(
      appRoutes,
      { enableTracing: true } // <-- debugging purposes only
    ),
    GojsAngularModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
