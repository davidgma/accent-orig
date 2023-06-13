import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { MainComponent } from './pages/main/main.component';
import { InfoComponent } from './pages/info/info.component';
import { SettingsComponent } from './pages/settings/settings.component';

const routes: Routes = [
  { path: '', component: MainComponent },
  { path: 'home', component: MainComponent },
  { path: 'info', component: InfoComponent },
  { path: 'settings', component: SettingsComponent },
  { path: 'debug', component: SettingsComponent },
  { path: '**', component: MainComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
