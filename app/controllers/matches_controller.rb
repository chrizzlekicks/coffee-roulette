# frozen_string_literal: true

class MatchesController < ApplicationController
  before_action :verify_authenticated

  def index
    @matches = Match.joins(:user_matches).where(user_matches: { user_id: current_user.id })
  end
end
