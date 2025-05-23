import { Renderer2 } from '@angular/core';
import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-auth-panel',
  templateUrl: './auth-panel.component.html',
  styleUrls: ['./auth-panel.component.css']
})
export class AuthPanelComponent {
  isDarkTheme = false;

  constructor(private router: Router, private renderer: Renderer2) { }

  ngOnInit(): void {
    const theme = localStorage.getItem('theme');
    this.isDarkTheme = theme === 'dark';
    this.applyTheme();
  }

  toggleTheme() {
    this.isDarkTheme = !this.isDarkTheme;
    localStorage.setItem('theme', this.isDarkTheme ? 'dark' : 'light');
    this.applyTheme();
  }

  applyTheme() {
    if (this.isDarkTheme) {
      this.renderer.addClass(document.body, 'dark-theme');
      this.renderer.removeClass(document.body, 'light-theme');
    } else {
      this.renderer.addClass(document.body, 'light-theme');
      this.renderer.removeClass(document.body, 'dark-theme');
    }
  }
  logout() {
    let cnf = confirm('Are You sure you want to Log OUT??');
    if (cnf == true) {
      sessionStorage.clear();
      this.router.navigate(['/']);
    }
  }
  collpase() {
    alert("worked")
  }

  isSideNavOpen = true; // Initially at 20%

  toggleSideNav() {
    this.isSideNavOpen = !this.isSideNavOpen;
  }

}
