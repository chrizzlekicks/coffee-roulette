# frozen_string_literal: true

class UsersController < ApplicationController
  before_action :verify_authenticated, except: :create

  def index
    users = User.all
    render json: users
  end

  def show
    user = User.find(params[:id])

    render json: user, status: :ok
  rescue ActiveRecord::RecordNotFound => e
    render json: e.message, status: :not_found
  rescue StandardError
    head :unprocessable_entity
  end

  def create
    user = User.create!(user_params)

    UserMailer.with(user:).welcome.deliver_now

    render json: user, status: :created
  rescue ActiveRecord::RecordInvalid => e
    render json: e.message, status: :bad_request
  rescue StandardError
    head :unprocessable_entity
  end

  def update
    return head :bad_request if params[:active].nil?

    current_user.update!(active: params[:active])

    head :ok
  end

  def destroy
    current_user.destroy!

    head :no_content
  end

  private

  def user_params
    params.require(:user).permit(:email, :username, :password_digest)
  end

  def verify_authenticated
    head :unauthorized unless is_logged_in?
  end
end
