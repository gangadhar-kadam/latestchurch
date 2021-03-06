# Copyright (c) 2015, New Indictrans Technologies Pvt. Ltd. and contributors
# For license information, please see license.txt

from __future__ import unicode_literals
import frappe
from frappe.model.document import Document
from frappe import throw, _, msgprint
from erpnext.setup.doctype.sms_settings.sms_settings import send_sms
from gcm import GCM

class GroupChurches(Document):
	def autoname(self):
		from frappe.model.naming import make_autoname
		self.name = make_autoname(self.zone + '/' + 'GRP' + '.####')

	def onload(self):
		frappe.errprint("in server onload")

	def get_region(self):
		frappe.errprint("get region")
		# to auto set region on load if zone is set
		region = frappe.db.sql("""select region from `tabZone`	where name ='%s'""", self.doc.zone)
		frappe.errprint(get_region)
		ret = {
			'region': region and region[0][0] or ''
		}
		return ret

	def set_higher_values(self):
		if self.region:
			value = frappe.db.sql("select name from `tabZones` where region='%s'"%(self.region),as_list=1)
			ret={}
			if value:
				ret={
					"zone": value[0][0]
				}
			return ret
		elif self.zone:
			value = frappe.db.sql("select region from `tabZones` where name='%s'"%(self.zone),as_list=1)
			ret={}
			if value:
				ret={
					"region": value[0][0]
				}
			return ret


def validate_duplicate(doc,method):
	if doc.get("__islocal"):
		res=frappe.db.sql("select name from `tabGroup Churches` where church_group='%s' and church_group_code='%s' and zone='%s'"%(doc.church_group,doc.church_group_code,doc.zone))
		if res:
			frappe.throw(_("Another Group Church '{0}' With Group Church Name '{1}' and Church Group Code '{2}' exist in Zone '{3}'..!").format(res[0][0],doc.church_group,doc.church_group_code,doc.zone))

		notify_msg = """Dear User,\n
			Region is created with name '%s' for zone '%s' \n
			\n
			Regards,\n
			Love World Synergy"""%(doc.church_group,doc.zone)
		notify = frappe.db.sql("""select value from `tabSingles` where doctype='Notification Settings' and field='on_creation_of_a_new_cell_pcf_church'""",as_list=1)
		if "Email" in notify[0][0]:
			if doc.contact_email_id:
				frappe.sendmail(recipients=doc.contact_email_id, content=notify_msg, subject='Region Creation Notification')
		if "SMS" in notify[0][0]:
			if doc.contact_phone_no:
				send_sms(doc.contact_phone_no, notify_msg)
		if "Push Notification" in notify[0][0]:
			data={}
			data['Message']=notify_msg
			gcm = GCM('AIzaSyBIc4LYCnUU9wFV_pBoFHHzLoGm_xHl-5k')
			res1=frappe.db.sql("select device_id from tabUser where name ='%s'" %(doc.contact_email_id),as_list=1)
			frappe.errprint(res1)
			if res1:
				res1 = gcm.json_request(registration_ids=res1, data=data,collapse_key='uptoyou', delay_while_idle=True, time_to_live=3600)


