from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import date
from enum import Enum


class PaymentMode(str, Enum):
    cash = "cash"
    cheque = "cheque"
    online = "online"


# --- Donor ---

class DonorCreate(BaseModel):
    name: str
    phone: Optional[str] = None
    email: Optional[str] = None
    address: Optional[str] = None


class DonorOut(DonorCreate):
    id: str


# --- Donation Line Item ---

class LineItem(BaseModel):
    account: str
    cost_center: str          # school/cost center name
    project: str              # one of the 12 projects
    amount: float
    narration: Optional[str] = None


# --- Donation ---

class DonationCreate(BaseModel):
    date: date
    donor_id: str
    payment_mode: PaymentMode
    fund_receipt_no: Optional[str] = None
    voucher_no: Optional[str] = None
    line_items: List[LineItem]


class DonationOut(DonationCreate):
    id: str
    total: float
