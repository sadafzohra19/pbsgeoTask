import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { MyMapComponent } from './my-map/my-map.component';

const routes: Routes = [
  {
    path: 'mymap',
    component: MyMapComponent,
  },
  {
    path: '**',
    component: MyMapComponent
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
