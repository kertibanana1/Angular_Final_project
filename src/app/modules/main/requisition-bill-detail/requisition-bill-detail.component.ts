import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { HttpRequest, HttpHandler, HttpEvent, HttpInterceptor } from '@angular/common/http';
import * as moment from 'moment';
import { AlertService } from 'src/app/services/alert.service';

import { RequisitionService } from './../../../services/requisition.service';
import { Subscription } from 'rxjs';
import { Users } from '../register/users';
import { AuthenticationService } from '../../../services//Authentication.service';
import * as jwt_decode from 'jwt-decode';
import * as _ from 'lodash';

@Component({
  selector: 'app-requisition-bill-detail',
  templateUrl: './requisition-bill-detail.component.html',
  styleUrls: ['./requisition-bill-detail.component.scss']
})
export class RequisitionBillDetailComponent implements OnInit {
  requisitionCode: any;
  requisitionBillDetail: any = [];
  requisitionBillDetailOnly: any;
  currentUser: Users;
  currentUserSubscription: Subscription;
  decoded: any;
  showReqWaitDetailAdmin: any;
  rowSelected: any = [];
  currentRow: any;
  modalEditBill = false;
  reqEditBill: any;
  find1: any;
  find2: any;

  constructor(
    private alertService: AlertService,
    private _Activatedroute: ActivatedRoute,
    private router: Router,
    private requisitionService: RequisitionService,
    private authenticationService: AuthenticationService,
  ) {
    this.currentUserSubscription = this.authenticationService.currentUser.subscribe(users => {
      this.currentUser = users;
      console.log('users', users);
      this.decoded = jwt_decode(users.token);
      console.log('decoded', this.decoded);

    });
  }

  async ngOnInit() {
    moment.locale('th');
    this.requisitionCode = this._Activatedroute.snapshot.paramMap.get('requisitionCode');
    console.log('id-pass', this.requisitionCode);
    await this.requisitionBill();
    await this.requisitionHeadBill();

  }

  async requisitionBill() {
    console.log('this.requisitionCode', this.requisitionCode);
    try {
      console.log('check', this.requisitionCode);
      const result: any = await this.requisitionService.showReqWaitDetail(this.requisitionCode);
      console.log('result', result);
      if (result.statusCode === 200) {
        this.requisitionBillDetail = result.rows;

        console.log('find1', _.findKey(this.requisitionBillDetail, { 'requisitionDetailStatus': '1' }));
        console.log('find2', _.findKey(this.requisitionBillDetail, { 'requisitionDetailStatus': '2' }));

        this.find1 = _.findKey(this.requisitionBillDetail, { 'requisitionDetailStatus': '1' });
        this.find2 = _.findKey(this.requisitionBillDetail, { 'requisitionDetailStatus': '2' });

        console.log('this.requisitionBillDetail', this.requisitionBillDetail);
        this.router.navigate(['main/requisition-bill-detail/' + this.requisitionCode]);

      }
    } catch (err) {
      console.log(err);
    }

  }

  async requisitionHeadBill() {

    console.log('this.requisitionCode', this.requisitionCode);
    try {
      console.log('check', this.requisitionCode);
      const result: any = await this.requisitionService.showReqWaitDetailOnly(this.requisitionCode);
      if (result.rows) {
        this.requisitionBillDetailOnly = result.rows;
        for (const item of this.requisitionBillDetailOnly) {
          item.date = moment(item.reqDate).format('DD');
          item.month = moment(item.reqDate).format('MMMM');
          item.year = moment(item.reqDate).add(543, 'years').format('YYYY');
          item.time = moment(item.reqDate).format('HH:mm');
          item.day = item.date + ' ' + item.month + ' ' + item.year;
        }
        console.log('this.requisitionBillDetailOnly', this.requisitionBillDetailOnly);

      }

    } catch (err) {
      console.log(err);
    }

  }

  async approve(requisitionCode) {
    this.requisitionCode = requisitionCode;
    console.log(this.requisitionCode);

    try {
      const result: any = await this.requisitionService.approveReq(this.requisitionCode);
      console.log('result', result);
      if (result.rows) {
        this.showReqWaitDetailAdmin = result.rows;
        console.log('this.showReqWaitDetailAdmin', this.showReqWaitDetailAdmin);
        this.alertService.successApprove(' อนุมัติเสร็จสิ้น ');
        this.requisitionHeadBill();
        this.requisitionBill();
        this.router.navigate(['main/requisition-bill-detail/' + this.requisitionCode]);

      }
    } catch (err) {
      console.log(err);
    }

  }

  async notApproveList(row) {
    this.currentRow = Object.assign({}, row);
    console.log('this.currentRow', this.currentRow.Requisition_requisitionCode);
    console.log('this.currentRow.cloth', this.currentRow.Cloth_clothId);

    try {
      // tslint:disable-next-line: max-line-length
      const result: any = await this.requisitionService.notApproveList(this.currentRow.Requisition_requisitionCode, this.currentRow.Cloth_clothId);
      console.log('result', result);
      if (result.rows) {
        // this.showReqWaitDetailAdmin = result.rows;
        // console.log('this.showReqWaitDetailAdmin', this.showReqWaitDetailAdmin);
        this.alertService.successNotApprove(' อนุมัติเสร็จสิ้น ');
        this.requisitionHeadBill();
        this.requisitionBill();
        this.router.navigate(['main/requisition-bill-detail/' + this.requisitionCode]);

      }
    } catch (err) {
      console.log(err);
    }

  }

  async notApproveReq(requisitionCode) {
    this.requisitionCode = requisitionCode;
    console.log(this.requisitionCode);

    try {
      const result: any = await this.requisitionService.notApproveReq(this.requisitionCode);

      console.log('result', result);
      if (result.rows) {
        this.showReqWaitDetailAdmin = result.rows;
        console.log('this.showReqWaitDetailAdmin', this.showReqWaitDetailAdmin);
        this.alertService.successNotApproveReq(' อนุมัติเสร็จสิ้น ');
        this.requisitionHeadBill();
        this.requisitionBill();
        this.router.navigate(['main/requisition-bill-detail/' + this.requisitionCode]);

      }
    } catch (err) {
      console.log(err);
    }

  }

  async showEditBill(row) {
    this.modalEditBill = true;
    this.currentRow = Object.assign({}, row);
    console.log('this.currentRow', this.currentRow.Requisition_requisitionCode);
  }

  async submitEdit() {
    console.log('this.currentRow', this.currentRow);
    try {
      // tslint:disable-next-line: max-line-length
      const result: any = await this.requisitionService.submitEdit(this.currentRow.Requisition_requisitionCode, this.currentRow.Cloth_clothId, this.currentRow.amountCloth);
      console.log('result', result);
      if (result.rows) {

        this.alertService.editSuccess(' แก้ไขสำเร็จ ');
        this.requisitionHeadBill();
        this.requisitionBill();
        this.router.navigate(['main/requisition-bill-detail/' + this.requisitionCode]);
        this.modalEditBill = false;

      }
    } catch (err) {
      console.log(err);
    }

  }

}