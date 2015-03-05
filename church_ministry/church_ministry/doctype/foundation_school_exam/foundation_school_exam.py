# Copyright (c) 2013, New Indictrans Technologies Pvt. Ltd. and contributors
# For license information, please see license.txt

from __future__ import unicode_literals
import frappe
from frappe.model.document import Document
from frappe.utils import cstr, cint,getdate,nowdate
from frappe import throw, _, msgprint

class FoundationSchoolExam(Document):
	
	def get_grade(self, score):
			query="select name from `tabGrade Master` where to_score>='"+cstr(score)+"' and from_score<='"+cstr(score)+"'"
			grade = frappe.db.sql(query)
			if not grade:
				frappe.errprint("not grade")
				frappe.msgprint(_("Grade not found for the score {0}").format(score))
			return {
				"grade": grade[0][0]
			}

	def on_submit(self):
		if self.is_member==1:
			email=frappe.db.sql("select email_id,member_name from `tabMember` where name='%s'"%(self.member))
		else:
			email=frappe.db.sql("select email_id,ftv_name from `tabFirst Time Visitor` where name='%s'"%(self.ftv))
		msg=="""Hello %s,<br> Thank you so much for your donation of amount '%s'. <br>Regards,<br>Varve"""%(email[0][1],self.amount)
		frappe.sendmail(recipients=email[0][0], sender='gangadhar.k@indictranstech.com', content=msg, subject='Partnership Arm Record')

@frappe.whitelist()
def loadftv(cell,visitor_type,foundation__exam):
	if foundation__exam=='Class 1':
		school_status='Nil'
	elif foundation__exam=='Class 2':
		school_status='Completed Class 1'
	elif foundation__exam=='Class 3':
		school_status='Completed Class 1&2'
	elif foundation__exam=='Class 4':
		school_status='Completed Class 1, 2 & 3'
	elif foundation__exam=='Class 5':
		school_status='Completed Class 1, 2 , 3 & 4'
	elif foundation__exam=='Class 6':
		school_status='Completed Class 1, 2 , 3 , 4 & 5'

	if visitor_type=='FTV':
		return {
		"ftv": [frappe.db.sql("select name,ftv_name from `tabFirst Time Visitor` where cell='%s' and school_status='%s' and approved=0"%(cell,school_status))]
		}
	else:
		return {
		"ftv": [frappe.db.sql("select name,member_name from `tabMember` where cell='%s' and school_status='%s'"%(cell,school_status))]
		}

def validate_duplicate(doc,method):
	if doc.get("__islocal"):
		res=frappe.db.sql("select name from `tabFoundation School Exam` where foundation__exam='%s' and cell='%s' and date='%s' and docstatus!=2"%(doc.foundation__exam,doc.cell,doc.date))
		if res:
			frappe.throw(_("Another Foundation School Exam '{0}' With Exam Name '{1}' , Cell Code '{2}' and date  '{3}'..!").format(res[0][0],doc.foundation__exam,doc.cell,doc.date))
	today=nowdate()
	if getdate(doc.date) >= getdate(today):		
		frappe.throw(_("Exam Date Should not be Future date"))

def update_attendance(doc,method):
	for d in doc.get('attendance'):
		greeting=''
		if d.grade!='D':
			greeting='Congratuations..!'
		else:
			greeting='Sorry..! You are Fail,'
		if doc.visitor_type=='FTV':
			ftvdetails=frappe.db.sql("select ftv_name,email_id from `tabFirst Time Visitor` where name='%s'"%(d.ftv_id))
		else:
			ftvdetails=frappe.db.sql("select member_name,email_id from `tabMember` where name='%s'"%(d.member_id))
		msg_member="""Hello %s,<br><br>
		%s You have grade '%s' in exam '%s' <br><br>Regrds,<br>Varve
		"""%(ftvdetails[0][0],greeting,d.grade,doc.foundation__exam)
		frappe.sendmail(recipients=ftvdetails[0][1], sender='gangadhar.k@indictranstech.com', content=msg_member, subject='Varve Exam Result')
		if d.grade!='D':
			exm=''
			if doc.foundation__exam=='Class 1':
				exm='Completed Class 1'
			elif doc.foundation__exam=='Class 2':
				exm='Completed Class 1&2'
			elif doc.foundation__exam=='Class 3':
				exm='Completed Class 1, 2 & 3'
			elif doc.foundation__exam=='Class 4':
				exm='Completed Class 1, 2 , 3 & 4'
			elif doc.foundation__exam=='Class 5':
				exm='Completed Class 1, 2 , 3 , 4 & 5'
			elif doc.foundation__exam=='Class 6':
				exm='Completed All Classes and Passed Exam'
			if doc.visitor_type=='FTV':
				frappe.db.sql("""update `tabFirst Time Visitor` set school_status='%s' where name='%s' """ % (exm,d.ftv_id))
			else:
				frappe.db.sql("""update `tabMember` set school_status='%s' where name='%s' """ % (exm,d.member_id))
	return "Done"
			

