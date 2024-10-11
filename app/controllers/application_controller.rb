# frozen_string_literal: true

class ApplicationController < ActionController::Base
  def index
    render 'layouts/application'
  end

  def current_user
    @current_user ||= session[:user_id] && User.find(session[:user_id])
  end

  def is_logged_in?
    current_user.present?
  end

  def log_out
    session.delete(:user_id)
    @current_user = nil

    render json: { message: 'Session closed' }, status: :ok
  end
end
