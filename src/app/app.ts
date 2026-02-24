import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Header } from "./header/header";
import { Footer } from "./footer/footer";
import { BackToTop } from "./back-to-top/back-to-top";
import { PwaInstall } from "./pwa-install/pwa-install";
import { LoadingComponent } from "./core/components/loading/loading";
import { ToastComponent } from "./core/components/toast/toast";

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Header, Footer, BackToTop, PwaInstall, LoadingComponent, ToastComponent],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {}
