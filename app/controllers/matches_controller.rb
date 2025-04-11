# frozen_string_literal: true

class MatchesController < ApplicationController
  before_action :verify_authenticated

  def index
    @current_user = current_user
    @matches = Match.joins(:user_matches).eager_load(:users).where(user_matches: { user_id: @current_user.id })
  end
end
