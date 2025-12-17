import React, { useEffect, useState } from 'react';
import { useAppContext } from '../context/AppContext';
import Card from '../components/UI/Card';
import Button from '../components/UI/Button';
import Modal from '../components/UI/Modal';
import RichTextEditor from '../components/UI/RichTextEditor';
import { Plus, Edit, Send, Eye, Save } from 'lucide-react';
import { EmailTemplate } from '../types';
import { useSendPromotionalMailsMutation } from '../services/api/notifyUsersApi';
import { useToast } from '../context/ToastContext';

const EmailCommunication: React.FC = () => {
  const { emailTemplates, addEmailTemplate, updateEmailTemplate, deleteEmailTemplate } = useAppContext();
  const[sendPromotionalMails,{isLoading,isError,isSuccess,reset}]=useSendPromotionalMailsMutation()
  const { showToast } = useToast();
  const [selectedTemplate, setSelectedTemplate] = useState<EmailTemplate | null>(null);
  const [isNewTemplateModalOpen, setIsNewTemplateModalOpen] = useState(false);
  const [isEditTemplateModalOpen, setIsEditTemplateModalOpen] = useState(false);
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isSendEmailModalOpen, setIsSendEmailModalOpen] = useState(false);
  
  const [templateName, setTemplateName] = useState('');
  const [templateSubject, setTemplateSubject] = useState('');
  const [templateContent, setTemplateContent] = useState('');
  const [recipientEmail, setRecipientEmail] = useState('');
  const [sendingStatus, setSendingStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle');
  
  // Handle create new template
  const handleCreateTemplate = () => {
    setTemplateName('');
    setTemplateSubject('');
    setTemplateContent('');
    setIsNewTemplateModalOpen(true);
  };
  
  // Handle edit template
  const handleEditTemplate = (template: EmailTemplate) => {
    setSelectedTemplate(template);
    setTemplateName(template.name);
    setTemplateSubject(template.subject);
    setTemplateContent(template.content);
    setIsEditTemplateModalOpen(true);
  };
  
  // Handle preview template
  const handlePreviewTemplate = (template: EmailTemplate) => {
    setSelectedTemplate(template);
    setIsPreviewModalOpen(true);
  };
  
  // Handle delete template
  // const handleDeleteTemplate = (template: EmailTemplate) => {
  //   setSelectedTemplate(template);
  //   setIsDeleteModalOpen(true);
  // };
  
  // Handle send email
  const handleSendEmail = (template: EmailTemplate) => {
    setSelectedTemplate(template);
    setRecipientEmail('');
    setSendingStatus('idle');
    setIsSendEmailModalOpen(true);
  };
  
  // Handle save new template
  const handleSaveNewTemplate = () => {
    if (templateName && templateSubject && templateContent) {
      addEmailTemplate({
        name: templateName,
        subject: templateSubject,
        content: templateContent
      });
      setIsNewTemplateModalOpen(false);
    }
  };
  
  // Handle update template
  const handleUpdateTemplate = () => {
    if (selectedTemplate && templateName && templateSubject && templateContent) {
      updateEmailTemplate({
        ...selectedTemplate,
        name: templateName,
        subject: templateSubject,
        content: templateContent
      });
      setIsEditTemplateModalOpen(false);
    }
  };
  
  // Handle delete template confirmation
  const handleDeleteConfirm = () => {
    if (selectedTemplate) {
      deleteEmailTemplate(selectedTemplate.id);
      setIsDeleteModalOpen(false);
    }
  };
  useEffect(() => {
    if (isSuccess) {
      console.log("Email sent successfully!");
      setTimeout(() => {
        reset(); // Reset the mutation state
        setIsSendEmailModalOpen(false); // Close the modal
      }, 2000);
    }
  }, [isSuccess, reset]);
  // Handle send email submission
  const handleSendEmailSubmit = async () => {
    if (selectedTemplate) {
      try {
        await sendPromotionalMails(selectedTemplate).unwrap();
        showToast('Email sent successfully!', 'success');
        setIsSendEmailModalOpen(false);
      } catch (error) {
        const errorMessage = (error as any)?.data?.message || 'Failed to send email. Please try again.';
        showToast(errorMessage, 'error');
      }
    }
  };
  console.log(isLoading,isError,isSuccess)
  // Replace variables in template content
  const replaceVariables = (content: string) => {
    return content
      .replace(/{userName}/g, 'John Doe')
      .replace(/{userEmail}/g, recipientEmail || 'john.doe@example.com');
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">Email Communication</h1>
        {/* <Button
          variant="primary"
          onClick={handleCreateTemplate}
        >
          <Plus size={18} className="mr-2" /> New Template
        </Button> */}
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {emailTemplates.map((template) => (
          <Card key={template.id} className="flex flex-col">
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-800 mb-2">{template.name}</h3>
              <p className="text-sm text-gray-600 mb-4">Subject: {template.subject}</p>
              <div className="text-sm text-gray-500 mb-4 line-clamp-3">
                <div dangerouslySetInnerHTML={{ __html: template.content.substring(0, 150) + '...' }} />
              </div>
              <div className="text-xs text-gray-400 mb-4">
                Last updated: {template.updatedAt}
              </div>
            </div>
            
            <div className="flex flex-wrap gap-2 mt-auto pt-4 border-t border-gray-100">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => handlePreviewTemplate(template)}
              >
                <Eye size={16} className="mr-1" /> Preview
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={() => handleSendEmail(template)}
              >
                <Send size={16} className="mr-1" /> Send
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => handleEditTemplate(template)}
              >
                <Edit size={16} className="mr-1" /> Edit
              </Button>
              {/* <Button
                variant="danger"
                size="sm"
                onClick={() => handleDeleteTemplate(template)}
              >
                <Trash2 size={16} className="mr-1" /> Delete
              </Button> */}
            </div>
          </Card>
        ))}
      </div>
      
      {emailTemplates.length === 0 && (
        <Card>
          <div className="text-center py-8">
            <p className="text-gray-500 mb-4">No email templates available</p>
            <Button
              variant="primary"
              onClick={handleCreateTemplate}
            >
              <Plus size={18} className="mr-2" /> Create Your First Template
            </Button>
          </div>
        </Card>
      )}
      
      {/* New Template Modal */}
      <Modal
        isOpen={isNewTemplateModalOpen}
        onClose={() => setIsNewTemplateModalOpen(false)}
        title="Create New Email Template"
        size="xl"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Template Name
            </label>
            <input
              type="text"
              value={templateName}
              onChange={(e) => setTemplateName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="e.g., Welcome Email"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email Subject
            </label>
            <input
              type="text"
              value={templateSubject}
              onChange={(e) => setTemplateSubject(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="e.g., Welcome to Our Platform"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email Content
            </label>
            <div className="mt-1">
              <RichTextEditor
                initialValue={templateContent}
                onChange={setTemplateContent}
                placeholder="Write your email content here..."
              />
            </div>
            <p className="mt-2 text-sm text-gray-500">
              {/* Use variables like {'{userName}'} and {'{userEmail}'} for personalization. */}
            </p>
          </div>
          
          <div className="flex justify-end space-x-3 pt-4">
            <Button
              variant="secondary"
              onClick={() => setIsNewTemplateModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleSaveNewTemplate}
              disabled={!templateName || !templateSubject || !templateContent}
            >
              <Save size={18} className="mr-2" /> Save Template
            </Button>
          </div>
        </div>
      </Modal>
      
      {/* Edit Template Modal */}
      <Modal
        isOpen={isEditTemplateModalOpen}
        onClose={() => setIsEditTemplateModalOpen(false)}
        title="Edit Email Template"
        size="xl"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Template Name
            </label>
            <input
              type="text"
              value={templateName}
              onChange={(e) => setTemplateName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email Subject
            </label>
            <input
              type="text"
              value={templateSubject}
              onChange={(e) => setTemplateSubject(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email Content
            </label>
            <div className="mt-1">
              <RichTextEditor
                initialValue={templateContent}
                onChange={setTemplateContent}
                placeholder="Write your email content here..."
              />
            </div>
            <p className="mt-2 text-sm text-gray-500">
              {/* Use variables like {'{userName}'} and {'{userEmail}'} for personalization. */}
            </p>
          </div>
          
          <div className="flex justify-end space-x-3 pt-4">
            <Button
              variant="secondary"
              onClick={() => setIsEditTemplateModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleUpdateTemplate}
              disabled={!templateName || !templateSubject || !templateContent}
            >
              <Save size={18} className="mr-2" /> Update Template
            </Button>
          </div>
        </div>
      </Modal>
      
      {/* Preview Template Modal */}
      <Modal
        isOpen={isPreviewModalOpen}
        onClose={() => setIsPreviewModalOpen(false)}
        title={`Preview: ${selectedTemplate?.name}`}
        size="lg"
      >
        {selectedTemplate && (
          <div className="space-y-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm text-gray-500">Subject:</p>
              <p className="text-lg font-medium">{selectedTemplate.subject}</p>
            </div>
            
            <div className="border border-gray-200 rounded-lg p-4">
              <div 
                className="prose max-w-none"
                dangerouslySetInnerHTML={{ 
                  __html: replaceVariables(selectedTemplate.content) 
                }} 
              />
            </div>
            
            <div className="flex justify-end pt-4">
              <Button
                variant="secondary"
                onClick={() => setIsPreviewModalOpen(false)}
              >
                Close
              </Button>
            </div>
          </div>
        )}
      </Modal>
      
      {/* Delete Template Modal */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Confirm Deletion"
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-gray-700">
            Are you sure you want to delete the template <span className="font-semibold">{selectedTemplate?.name}</span>?
            This action cannot be undone.
          </p>
          
          <div className="flex justify-end space-x-3 pt-4">
            <Button
              variant="secondary"
              onClick={() => setIsDeleteModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={handleDeleteConfirm}
            >
              Delete Template
            </Button>
          </div>
        </div>
      </Modal>
      
      {/* Send Email Modal */}
      <Modal
        isOpen={isSendEmailModalOpen}
        onClose={() => sendingStatus !== 'sending' && setIsSendEmailModalOpen(false)}
        title="Send Email"
        size="md"
      >
        {selectedTemplate && (
          <div className="space-y-4">
            {sendingStatus === 'idle' && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Template
                  </label>
                  <input
                    type="text"
                    value={selectedTemplate.name}
                    disabled
                    className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Subject
                  </label>
                  <input
                    type="text"
                    value={selectedTemplate.subject}
                    disabled
                    className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100"
                  />
                </div>
                
                {/* <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Recipient Email
                  </label>
                  <input
                    type="email"
                    value={recipientEmail}
                    onChange={(e) => setRecipientEmail(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter recipient email"
                    required
                  />
                </div> */}
                
                <div className="flex justify-end space-x-3 pt-4">
                  <Button
                    variant="secondary"
                    onClick={() => setIsSendEmailModalOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="primary"
                    onClick={handleSendEmailSubmit}
                    disabled={isLoading}
                  >
                    <Send size={18} className="mr-2" /> Send Email
                  </Button>
                </div>
              </>
            )}
            
            {isLoading && (
              <div className="py-8 text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
                <p className="text-gray-700">Sending email...</p>
              </div>
            )}
            
            {isSuccess && (
              <div className="py-8 text-center">
                <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                </div>
                <p className="text-gray-700 mb-2">Email sent successfully!</p>
              </div>
            )}
            
            {isError && (
              <div className="py-8 text-center">
                <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
                  <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                  </svg>
                </div>
                <p className="text-gray-700 mb-2">Failed to send email</p>
                <p className="text-sm text-gray-500">Please try again later</p>
                <Button
                  variant="secondary"
                  onClick={() => setSendingStatus('idle')}
                  className="mt-4"
                >
                  Try Again
                </Button>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
};

export default EmailCommunication;