﻿import { Component, OnInit, OnDestroy, NgZone } from '@angular/core';
import {Router} from '@angular/router'
import { User } from '../_models';
import { Order } from '../_models';
import { UserService } from '../_services';
import { OrderService } from '../_services';
import { AlertService, AuthenticationService } from '../_services';
import * as am4core from '@amcharts/amcharts4/core';
import * as am4charts from '@amcharts/amcharts4/charts';
import am4themes_animated from '@amcharts/amcharts4/themes/animated';
import { Http, Headers, RequestOptions, Response } from '@angular/http';

am4core.useTheme(am4themes_animated);


@Component({
    moduleId: module.id,
    templateUrl: 'home.component.html',
    styles: [``]
})

export class HomeComponent implements OnInit, OnDestroy {
    currentUser: User;
    users: User[] = [];
    orders: Order[] = [];
    orders_today: Order[] = [];
    orders_plot: Order[] = [];
    dataProvider: any = [];

    loggedUser: User;

    private chart: am4charts.XYChart;

    private timer: any;

    constructor(
        private userService: UserService,
        private authenticationService: AuthenticationService,
        private alertService: AlertService,
        private orderService: OrderService,
        private router: Router,
        private zone: NgZone,
        private http: Http) {
        this.currentUser = JSON.parse(localStorage.getItem('currentUser'));
        if (this.currentUser) {
            console.log(JSON.stringify(this.currentUser.user.username));
        } else {
          location.reload();
        }
    }

    ngOnInit() {
        // this.loadAllUsers();
        this.fetchUser(); // To fetch logged in user
        this.authenticationService.getNewToken(); // To get new token
        this.authenticationService.getNewTokenHandler(); // To get new token after 2 minutes
        this.loadOrdersToday(); // To get orders today
        this.loadOrdersPlot(); // For orders graph with amcharts plugin
        // this.loadAllDelivered(0); // To get total orders
        this.orderService.getOrdersPlot().forEach(orders_plot => {

             console.log(orders_plot);
        });
        this.initScript();
    }

    ngAfterViewInit() {
        this.zone.runOutsideAngular(() => {
            const chart = am4core.create('chartdiv', am4charts.XYChart);
            chart.paddingRight = 20;
            const data = [];
            let visits = 10;
            for (let i = 1; i < 366; i++) {
                visits += Math.round((Math.random() < 0.5 ? 1 : -1) * Math.random() * 10);
                data.push({ date: new Date(2018, 0, i), name: "name" + i, value: visits });
            }
            chart.data = data;
            const dateAxis = chart.xAxes.push(new am4charts.DateAxis());
            dateAxis.renderer.grid.template.location = 0;
            const valueAxis = chart.yAxes.push(new am4charts.ValueAxis());
            valueAxis.tooltip.disabled = true;
            valueAxis.renderer.minWidth = 35;
            const series = chart.series.push(new am4charts.LineSeries());
            series.dataFields.dateX = 'date';
            series.dataFields.valueY = 'value';
            series.tooltipText = '{valueY.value}';
            chart.cursor = new am4charts.XYCursor();
            const scrollbarX = new am4charts.XYChartScrollbar();
            scrollbarX.series.push(series);
            chart.scrollbarX = scrollbarX;
            this.chart = chart;
        });
    }

    ngOnDestroy() {
      this.zone.runOutsideAngular(() => {
        if (this.chart) {
          this.chart.dispose();
        }
      });
    }

    initScript() {
        // Modify some styles on home entry
        document.body.style.display = 'block';
        document.documentElement.style.display = 'block';
        document.body.style.backgroundColor = '#f9f9f9';
        document.getElementById('header').style.display = 'block';
        document.getElementById('left-sidebar-nav').style.display = 'block';
        document.getElementById('fab_id').style.display = 'block';
        // document.getElementById('main').removeAttribute('id');
    }

    deleteUser(id: number) {
      this.userService.delete(id).subscribe(() => { this.loadAllUsers() }, error => { console.log('Error #333'); });
    }

    private loadOrdersToday() {
      const orders_today_ = this.orderService.getOrdersToday();
      orders_today_.subscribe(orders_today => { this.orders_today = orders_today }, error => {console.log('Error #333');});
    }

    private loadOrders(offset) {
      this.orderService.getAllOrders(offset).subscribe(orders => { this.orders = orders }, error => { console.log('Error #333'); });
    }

   private loadOrdersPlot() {
      const orders_plot_ = this.orderService.getOrdersPlot();
      orders_plot_.subscribe(orders_plot => { this.orders_plot = orders_plot }, error => { console.log('Error #333'); });

    }

    private fetchUser(){
      const fetch_ = this.userService.fetch();
      fetch_.subscribe(users => { this.users = users; }, error => { console.log('Error #333'); });
    }

    private loadAllUsers() {
      const load_all_ = this.userService.getAll();
      load_all_.subscribe(users => { this.users = users; }, error => { console.log('Error #333'); });
    }
}
