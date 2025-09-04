# frozen_string_literal: true

class UsersController < ApplicationController
  before_action :verify_authenticated, except: :create

  def index
    users = User.all
    render json: users
  end

  def show
    user = current_user

    render json: {
      id: user.id,
      username: user.username,
      email: user.email,
      active: user.active,
      created_at: user.created_at
    }, status: :ok
  rescue ActiveRecord::RecordNotFound => e
    render json: { message: e.message }, status: :not_found
  rescue StandardError
    head :unprocessable_entity
  end

  def create
    user = User.create!(user_params)

    UserMailer.with(user:).welcome.deliver_now

    render json: user, status: :created
  rescue ActiveRecord::RecordInvalid => e
    render json: { message: e.message }, status: :bad_request
  rescue StandardError
    head :unprocessable_entity
  end

  def update
    return head :bad_request if update_params.blank?

    current_user.update!(update_params)

    render json: current_user.slice(:email, :username, :active), status: :ok
  rescue ActiveRecord::RecordInvalid => e
    render json: { message: e.message }, status: :bad_request
  rescue StandardError
    head :unprocessable_entity
  end

  def destroy
    current_user.destroy!

    head :no_content
  end

  private

  def user_params
    params.require(:user).permit(:email, :username, :password, :password_confirmation)
  end

  def update_params
    params.require(:user).permit(:email, :username, :password, :password_confirmation, :active)
  end
end
