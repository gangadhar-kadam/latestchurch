# Copyright (c) 2013, New Indictrans Technologies Pvt. Ltd. and contributors
# For license information, please see license.txt

from __future__ import unicode_literals
import frappe
from frappe.model.document import Document

class EventAttendance(Document):
	def  load_table(self):
		self.set('event_attendace_details', [])
		member_ftv = frappe.db.sql("select name,ftv_name from `tabFirst Time Visitor` where cell='%s' union select \
			name,member_name from `tabMember` where cell='%s'"%(self.cell,self.cell))
		for d in member_ftv:
			child = self.append('event_attendace_details', {})
			child.id = d[0]
			child.person_name = d[1]
