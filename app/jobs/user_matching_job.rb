class UserMatchingJob < ApplicationJob
  queue_as :default

  def perform(*args)
    'ello ello'
    # Do something later
  end
end
