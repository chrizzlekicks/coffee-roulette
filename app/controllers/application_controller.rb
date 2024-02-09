class ApplicationController < ActionController::API
  def current_user
    @current_user ||= session[:user_id] && User.find(session[:user_id])
  end

  def is_logged_in?
    current_user.present?
  end
end
